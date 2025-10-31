import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, ActivityIndicator } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

const MODEL_JSON = require('../assets/model.json');
const MODEL_WEIGHTS = require('../assets/group1-shard4of4.bin');
const model = await tf.loadGraphModel(bundleResourceIO(MODEL_JSON, MODEL_WEIGHTS));
const IMAGE_PATH = FileSystem.documentDirectory + '1.jpg'; // Replace with actual image path
const INPUT_SIZE = 640;
const CONF_THRESHOLD = 0.25;
const NMS_THRESHOLD = 0.45;

const classNames = require('./assets/labels.json').names;

const YoloDetector = () => {
  const [model, setModel] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await tf.loadGraphModel(bundleResourceIO(MODEL_JSON, MODEL_WEIGHTS));
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (model) runDetection();
  }, [model]);

  const runDetection = async () => {
    const imgBuffer = await FileSystem.readAsStringAsync(IMAGE_PATH, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const rawImageData = tf.util.encodeString(imgBuffer, 'base64').buffer;
    const imageTensor = decodeJpeg(new Uint8Array(rawImageData))
      .resizeBilinear([INPUT_SIZE, INPUT_SIZE])
      .div(tf.scalar(255.0))
      .expandDims(0);

    const output = await model.executeAsync(imageTensor);
    const raw = output.arraySync()[0]; // shape: [234, 8400]
    const transposed = tf.tensor(raw).transpose().arraySync(); // [8400, 234]

    const detections = transposed.map(row => {
      const [cx, cy, w, h] = row.slice(0, 4);
      const classScores = row.slice(4);
      const classId = classScores.indexOf(Math.max(...classScores));
      const confidence = Math.max(...classScores);
      return { cx, cy, w, h, classId, confidence };
    });

    const filtered = detections.filter(d => d.confidence > CONF_THRESHOLD);

    const converted = filtered.map(d => {
      const x1 = (d.cx - d.w / 2) * INPUT_SIZE;
      const y1 = (d.cy - d.h / 2) * INPUT_SIZE;
      const x2 = (d.cx + d.w / 2) * INPUT_SIZE;
      const y2 = (d.cy + d.h / 2) * INPUT_SIZE;
      return { ...d, x1, y1, x2, y2 };
    });

    setBoxes(converted);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: 'center', marginTop: 20 }}>YOLO Detection</Text>
      <Image
        source={{ uri: IMAGE_PATH }}
        style={{ width: INPUT_SIZE, height: INPUT_SIZE }}
        onLoad={({ nativeEvent }) => {
          setImageDims({
            width: nativeEvent.source.width,
            height: nativeEvent.source.height,
          });
        }}
      />
      <Svg
        width={INPUT_SIZE}
        height={INPUT_SIZE}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {boxes.map((box, idx) => (
          <React.Fragment key={idx}>
            <Rect
              x={box.x1}
              y={box.y1}
              width={box.x2 - box.x1}
              height={box.y2 - box.y1}
              stroke="red"
              strokeWidth="2"
              fill="transparent"
            />
            <SvgText
              x={box.x1}
              y={box.y1 - 5}
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {classNames[box.classId]}: {box.confidence.toFixed(2)}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
      {!model && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </View>
  );
};

export default YoloDetector;