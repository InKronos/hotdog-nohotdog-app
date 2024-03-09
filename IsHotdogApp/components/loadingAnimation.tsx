import { ActivityIndicator, View, Text, StyleSheet } from "react-native"


const LoadingAnimation = (props: LoadingComponentParams) => {
    return(
        <View style={styles.indicatorWrapper}>
            <ActivityIndicator size="large" style={styles.indicator}/>
            <Text style={styles.indicatorText}>{props.text}.</Text>
        </View>
    )
}

interface LoadingComponentParams {
    text: string;
}

const styles = StyleSheet.create({
    
    indicatorWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicator: {},
    indicatorText: {
      fontSize: 18,
      marginTop: 12,
    },
  });

export default LoadingAnimation;