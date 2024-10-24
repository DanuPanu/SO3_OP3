import { CameraView, CameraType, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View, Image, TextInput } from 'react-native';
import { Appbar, Dialog, FAB, Portal, Provider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface Kuvaustiedot {
  kuvaustila : boolean,
  kuva? : CameraCapturedPicture,
  nimi : string
}

export default function App() {

  // Kuvauksen tietoja ja kuvan ottoa
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
                                                              kuvaustila : false,
                                                              nimi : ""
                                                            })
  const kameraRef : any = useRef<any>(CameraView);

  const tekstikentta : React.MutableRefObject<any> = useRef<TextInput>();

  const otaKuva = async () : Promise<void>=> {

      const apukuva : CameraCapturedPicture = await kameraRef.current.takePictureAsync()

      setKuvaustiedot({
        ...kuvaustiedot,
        kuva : apukuva,
        kuvaustila : false
      })

      showDialog();
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Dialog ikkunan tietoja
  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false)

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    //Kamera näkymä
    (kuvaustiedot.kuvaustila)
    ? <SafeAreaProvider>
      <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={kameraRef}>
        <FAB
          style={styles.nappiSulje}
          icon="close"
          label="Sulje"
          onPress={() => setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila : false
          })}
        />
        <FAB
          style={styles.nappiOtaKuva}
          label="Ota kuva"
          onPress={otaKuva}
        />
        <View style={styles.kaannaKamera}>
          <FAB
            icon="camera-flip"
            onPress={toggleCameraFacing}
          />
        </View>
      </CameraView>
    </View>
    </SafeAreaProvider>

    // Normi näkymä
      :
      <SafeAreaProvider>
        <Provider>
      <Appbar.Header>
        <Appbar.Content title="Kuvaussovellus"/>
        <Appbar.Action
          icon="camera"
          onPress={() => setKuvaustiedot({
            ...kuvaustiedot,
            kuvaustila : true
          })}
        />
      </Appbar.Header>
      <View>
        <Text style={styles.text}>Tervetuloa ottamaan kuvia!</Text>
        {(Boolean(kuvaustiedot.kuva))
          ?<>
          <Image
            style={styles.kuva}
            source={{uri: kuvaustiedot.kuva?.uri}}
          />
          <Text style={styles.text}>{tekstikentta.current?.value}</Text>
          </>
          : null
        }

    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Actions>
          <TextInput 
          style={{marginRight: 110}}
          ref={tekstikentta}
          placeholder='Kuvan nimi:'
          onChangeText={ (teksti : string) => tekstikentta.current.value = teksti}
          />
          <Button title="Valmis" onPress={hideDialog}></Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>

      </View>
      </Provider>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  kaannaKamera: {
    position: "absolute",
    margin: 20,
    top: 60,
    right: 10
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20
  },
  nappiSulje: {
    position: "absolute",
    margin: 20,
    top: 60,
    left: 0
  },
  nappiOtaKuva: {
    position: "absolute",
    margin: 20,
    bottom: 20,
    right: 20
  },
  kuva: {
    width: 300,
    height: 400,
    resizeMode: "stretch",
    margin: "auto"
  }
});