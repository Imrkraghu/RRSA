import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as FileSystem from 'expo-file-system';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

const IMAGE_PATH = FileSystem.documentDirectory + '1.jpg'; // Replace with actual image path
const INPUT_SIZE = 640;

const CocoDetector = () => {
  const [model, setModel] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [imageDims, setImageDims] = useState({ width: INPUT_SIZE, height: INPUT_SIZE });

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
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
      .expandDims(0);

    const predictions = await model.detect(imageTensor);
    const converted = predictions.map(pred => ({
      x1: pred.bbox[0],
      y1: pred.bbox[1],
      x2: pred.bbox[0] + pred.bbox[2],
      y2: pred.bbox[1] + pred.bbox[3],
      label: pred.class,
      confidence: pred.score,
    }));

    setBoxes(converted);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: 'center', marginTop: 20 }}>COCO-SSD Detection</Text>
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
              stroke="lime"
              strokeWidth="2"
              fill="transparent"
            />
            <SvgText
              x={box.x1}
              y={box.y1 - 5}
              fill="black"
              fontSize="12"
              fontWeight="bold"
            >
              {box.label}: {box.confidence.toFixed(2)}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
      {!model && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </View>
  );
};

export default CocoDetector;