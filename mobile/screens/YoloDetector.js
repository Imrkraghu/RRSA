import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

// Static requires for bundling (ensure these exact filenames exist in /assets)
const MODEL_JSON = require('../assets/model.json');
const MODEL_WEIGHTS = require('../assets/group1-shard4of4.bin');
const LABELS = require('../assets/labels.json').names;

const IMAGE_PATH = FileSystem.documentDirectory + '1.jpg'; // replace with actual image path if needed
const INPUT_SIZE = 640;
const CONF_THRESHOLD = 0.25;

export default function YoloDetector() {
  const [model, setModel] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Waiting for tf ready...');
        await tf.ready();
        console.log('tf ready. Loading model...');
        const loaded = await tf.loadGraphModel(bundleResourceIO(MODEL_JSON, MODEL_WEIGHTS));
        if (!mountedRef.current) return;
        setModel(loaded);
        setLoading(false);
        console.log('Model loaded');
      } catch (err) {
        console.error('Model load failed', err);
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (model) {
      (async () => {
        try {
          await runDetection();
        } catch (err) {
          console.error('runDetection failed', err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // helper: read base64 from file and convert to Uint8Array suitable for decodeJpeg
  const base64ToUint8Array = (base64) => {
    // tf.util.encodeString handles base64 -> ArrayBuffer
    const buf = tf.util.encodeString(base64, 'base64').buffer;
    return new Uint8Array(buf);
  };

  const runDetection = async () => {
    if (!model) {
      console.warn('runDetection called without model');
      return;
    }

    try {
      const exists = await FileSystem.getInfoAsync(IMAGE_PATH);
      if (!exists.exists) {
        console.warn('Image not found at', IMAGE_PATH);
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(IMAGE_PATH, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const uint8 = base64ToUint8Array(base64);
      const imageTensor = decodeJpeg(uint8)
        .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
        .div(tf.scalar(255.0))
        .expandDims(0);

      // model.executeAsync sometimes returns tensors or array of tensors
      const prediction = await model.executeAsync(imageTensor);
      // normalize output handling: could be tensor or array. We convert to arraySync safely.
      let outTensor;
      if (Array.isArray(prediction)) {
        outTensor = prediction[0];
      } else {
        outTensor = prediction;
      }

      const outArr = outTensor.arraySync();

      // Depending on exported model shape, adapt here. This assumes shape [1, N, M] or [N, M]
      const raw = Array.isArray(outArr[0]) ? outArr[0] : outArr;
      // raw expected to be [num_dets, vector_len] or [vector_len, num_dets] — adapt if necessary
      // Here we follow your previous assumption: raw shape [234, 8400] then transpose -> [8400, 234]
      // If raw looks inverted, you may need to inspect console logs.
      // We'll attempt to convert to 2D array of detections in a robust way:

      let detections2D = raw;
      // If raw is 2D but first dimension seems small (e.g., 234) and second large (8400) transpose:
      if (raw.length > 0 && raw[0].length && raw.length < raw[0].length) {
        // transpose
        detections2D = raw[0].map((_, colIndex) => raw.map(row => row[colIndex]));
      }

      // If still not proper, log and abort
      if (!detections2D || !detections2D.length || !detections2D[0].length) {
        console.warn('Unexpected model output shape, skipping detection', { outArrLength: outArr.length });
        return;
      }

      // Map detections -> {cx,cy,w,h,classId,confidence}
      const detections = detections2D.map(row => {
        const cx = row[0];
        const cy = row[1];
        const w = row[2];
        const h = row[3];
        const classScores = row.slice(4);
        const maxScore = Math.max(...classScores);
        const classId = classScores.indexOf(maxScore);
        return { cx, cy, w, h, classId, confidence: maxScore };
      });

      const filtered = detections.filter(d => d.confidence > CONF_THRESHOLD);

      const converted = filtered.map(d => {
        const x1 = (d.cx - d.w / 2) * INPUT_SIZE;
        const y1 = (d.cy - d.h / 2) * INPUT_SIZE;
        const x2 = (d.cx + d.w / 2) * INPUT_SIZE;
        const y2 = (d.cy + d.h / 2) * INPUT_SIZE;
        return { ...d, x1, y1, x2, y2 };
      });

      if (mountedRef.current) setBoxes(converted);

      // dispose tensors created by decode and model if not returned
      try {
        if (Array.isArray(prediction)) {
          prediction.forEach(t => { if (t && t.dispose) t.dispose(); });
        } else if (prediction && prediction.dispose) {
          prediction.dispose();
        }
        if (imageTensor && imageTensor.dispose) imageTensor.dispose();
      } catch (e) {
        // swallow dispose errors
      }
    } catch (err) {
      console.error('runDetection error', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YOLO Detection</Text>

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: IMAGE_PATH }}
          style={{ width: INPUT_SIZE, height: INPUT_SIZE }}
          resizeMode="contain"
        />

        <Svg
          width={INPUT_SIZE}
          height={INPUT_SIZE}
          style={StyleSheet.absoluteFill}
        >
          {boxes.map((box, idx) => {
            const label = LABELS[box.classId] || `class_${box.classId}`;
            return (
              <React.Fragment key={idx}>
                <Rect
                  x={box.x1}
                  y={box.y1}
                  width={Math.max(0, box.x2 - box.x1)}
                  height={Math.max(0, box.y2 - box.y1)}
                  stroke="red"
                  strokeWidth="2"
                  fill="transparent"
                />
                <SvgText
                  x={box.x1}
                  y={Math.max(12, box.y1 - 5)}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {`${label}: ${box.confidence.toFixed(2)}`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' },
  title: { color: '#fff', textAlign: 'center', marginTop: 20 },
  imageWrapper: { width: INPUT_SIZE, height: INPUT_SIZE, marginTop: 12 },
});