import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraCapturedPicture, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';;
import CameraPreview from './components/cameraPreview';
import {bundleResourceIO} from "@tensorflow/tfjs-react-native"
import LoadingAnimation from './components/loadingAnimation';

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<CameraCapturedPicture | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [model, setModel] = useState<tf.LayersModel | null>(null)

  let camera: Camera | null;

  const modelJson = require("./assets/hotdog-nothodog-model/model.json")
  const weights = [
    require("./assets/hotdog-nothodog-model/group1-shard1of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard2of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard3of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard4of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard5of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard6of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard7of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard8of9.bin"),
    require("./assets/hotdog-nothodog-model/group1-shard9of9.bin")
    ];


  /*if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }*/

  useEffect(() => {
    setIsModelLoading(true);
    const  start = async() =>{
      const {status} = await Camera.requestCameraPermissionsAsync()
      if(status === 'granted'){
        await tf.ready();
        await loadModel();
     
      }else{
        return (
          <View style={styles.container}>
            <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
          </View>
        );
      }
    }
    start();
  }, [])
  
  

  const loadModel = async () => {
    setIsModelLoading(true)
    try {
        const model = await tf.loadLayersModel(bundleResourceIO(modelJson, weights))
        setModel(model)
        setIsModelLoading(false)
        console.log("got model")
    } catch (error) {
        console.log(error)
        console.log("NO model")
        setIsModelLoading(false)
    }
}

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const __takePicture = async () => {
 
    if (!camera) return
    const photo = await camera.takePictureAsync();
    console.log(photo)
    setPreviewVisible(true)
    setCapturedImage(photo)
  }
  
  return (
    <>
    {isModelLoading ? <LoadingAnimation text='Model is loading...'/> :  
    <>
    {previewVisible && capturedImage ? (<CameraPreview photo={capturedImage} model={model} setPreviewVisible={setPreviewVisible}/>):
     <Camera style={styles.camera} type={type}
     ref={(r) => {camera = r}}>
     <View
      style={{
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      flex: 1,
      width: '100%',
      padding: 20,
      justifyContent: 'space-between'
      }}
    >
      <View 
      style={{
      alignSelf: 'center',
      flex: 1,
      alignItems: 'center'
      }}
      >
          <TouchableOpacity
          onPress={__takePicture}
          style={{
          width: 70,
          height: 70,
          bottom: 0,
          borderRadius: 50,
          backgroundColor: '#fff'
          }}
          />
    </View>
    </View>
    </Camera>
    }
    </>
  }

  </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
    width: "100%"
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    
    alignSelf: 'center',
    alignItems: 'center',
    margin: 105
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#fff',
    width: 70
    ,
    height: 70
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
