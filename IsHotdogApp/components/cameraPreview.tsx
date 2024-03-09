import { Button, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import * as tf from '@tensorflow/tfjs';;
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {bundleResourceIO, decodeJpeg} from "@tensorflow/tfjs-react-native"
import * as jpeg from 'jpeg-js'
import * as FileSystem from 'expo-file-system';
import { CameraCapturedPicture } from "expo-camera";
import LoadingAnimation from "./loadingAnimation";
import * as ImageManipulator from 'expo-image-manipulator';

const CameraPreview = (props: CameraPreviewComponentParams) => {
    console.log('sdsfds', props.photo)
    const [isDetected, setIsDetected] = useState(false);
    const [isHotdog, setIsHotdog] = useState(false);
   
    useEffect(() => {
      preprocess(props.photo).then((photo) => {
        (props.model?.predict(photo) as tf.Tensor).array().then((result) => {
          const resultArray: number[][] = result as number[][];
          if(resultArray[0][0] > resultArray[0][1])
            setIsHotdog(true);
          else
            setIsHotdog(false);
          setIsDetected(true);
          console.log(resultArray[0]); 
        });
        //console.log(result);
        console.log("done")
      }).catch(err => console.log(err))
    }, [])

   
    //const modelJson = require('../path/to/model.json');
    

    const resizeImage = async (uri: string, width: number, height: number) => {
      try {
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width, height } }],
          { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
        );
        return resizedImage.uri;
      } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
      }
    };

    const preprocess = async (photo: any) => {
      try {
        const resizedUri = await resizeImage(photo.uri, 128, 128);
    
        // Read the resized image file as base64
        const base64 = await FileSystem.readAsStringAsync(resizedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
    
        // Decode the base64-encoded image to a buffer
        const imgBuffer = tf.util.encodeString(base64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer);
    
        // Decode the raw image data (JPEG) to a tensor
        const imageTensor = decodeJpeg(raw);
    
        const float32 = imageTensor.toFloat();

        // Normalize the image
        const normalized = tf.div(float32, 255.0);
    
        // Expand dimensions to get a batch shape
        const batched = normalized.expandDims(0);
    
        return batched;
      } catch (error) {
        console.error('Error preprocessing image:', error);
        throw error;
      }
    };
    /*const preprocess = (photo : any) =>
    {
      const imgBuffer = tf.util.encodeString(photo, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)  
      const imageTensor = decodeJpeg(raw);
        //convert the image data to a tensor 
        let tensor = tf.browser.fromPixels(photo);
        //resize to 50 X 50
        const resized = tf.image.resizeBilinear(tensor, [128, 128]).toFloat();
        // Normalize the image 
        const batched = tensor.expandDims(0);

        //We add a dimension to get a batch shape 
        
        return batched

    }*/

   

    
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%'
        }}
        
      >
        {!isDetected ? <LoadingAnimation text="Evaluating...."/> :
        <TouchableOpacity
        style={{
          width: '100%',
          height: '100%'
        }}
        onPress={() => {props.setPreviewVisible(false)}}>
        {isHotdog ? 
        <View
        style={{
          backgroundColor: 'green',
          width: '100%',
          height: "20%",
          justifyContent: "center",            
          alignItems: "center",
        }}>
          <Text
          style={{
            alignSelf: "center",
            color: "white",
            fontWeight: "bold",
            textShadowColor: "black",
            textShadowRadius: 1,
            textShadowOffset: {
              width: 2,
              height: 2
            },
            fontSize: 50
          }}>
            Hotdog
          </Text>
        </View>
        : <></>}
        
        <ImageBackground
          source={{uri: props.photo && props.photo.uri}}
          style={{
            flex: 1
          }}
          
        />
        {!isHotdog ?
        <View
          style={{
            backgroundColor: 'red',
            width: '100%',
            height: "20%",
            justifyContent: "center",            
            alignItems: "center",

          }}>
            <Text
            style={{
              alignSelf: "center",
              color: "white",
              fontWeight: "bold",
              textShadowColor: "black",
              textShadowRadius: 1,
              textShadowOffset: {
                width: 2,
                height: 2
              },
              fontSize: 50
            }}>
              Not hotdog
            </Text>
        </View>
        : <></>}
        </TouchableOpacity>}
      </View>
    )
  }

interface CameraPreviewComponentParams{
  photo: CameraCapturedPicture;
  model: tf.LayersModel | null;
  setPreviewVisible: Dispatch<SetStateAction<boolean>>;
}

export default CameraPreview;