# SenseCAP-Decoder

TTN payload decoding script for SenseCAP LoRaWAN messages
This script is used for decoding the LoRaWAN messages sent from the SenseCAP nodes. After decoding, users' applications will get more friendly and readable messages from TTN data API.

## How to Use

#### 1. Prerequisites

We assume that you already setup your gateway and SenseCAP nodes correctly, and the SenseCAP nodes can send messages to your TTN application. You can already observe the data transmisstion through TTN console.

![image](https://user-images.githubusercontent.com/5130185/76604764-48b49180-654a-11ea-992b-761bf8179590.png)

#### 2. Configure the Payload Decoder

- Please navigate to the `Payload Formats` tab of your application to which your SenseCAP nodes send data.
- Select `Custom` for `Payload Format`
- Copy and paste the whole contents of `decoder.js` to the `decoder` textarea.
  > If you are using the latest version of TTN v3, you may encounter an error that exceeds the character limit. In this case, you will need to use `decoder_new-v3-uglifyjs.js` instead.
- Click `save payload functions`

![image](https://user-images.githubusercontent.com/5130185/76605545-954c9c80-654b-11ea-984e-272c58492e85.png)


#### 3. Check the Decoded Messages

You may test the decoding script with sample payload first. To do this,  just copy `01 01 10 98 53 00 00 01 02 10 A8 7A 00 00 AF 51` into the `Payload` text input, and click `Test` button. If succeeded, you will see a successfully parsed JSON structure below.

![image](https://user-images.githubusercontent.com/5130185/76605914-43584680-654c-11ea-9074-6e78d93059a7.png)

Then let's check out the magic of the script. We navigate to the `Data` tab, and you can expand any uploaded message to check the `Fields` in the payload. These fields are just populated by the script.

![image](https://user-images.githubusercontent.com/5130185/76606268-ec9f3c80-654c-11ea-90e0-332f186475f3.png)

If you're subscribing the messages with TTN's MQTT Data API, you will also get parsed JSON payload fields.

```
Client mosq-TCSlhYcKaRCn3cIePE received PUBLISH (d0, q0, r0, m0, 'lorawan868/devices/2cf7f12010700041/up', ... (719 bytes))
lorawan868/devices/2cf7f12010700041/up {"app_id":"lorawan868","dev_id":"2cf7f12010700041","hardware_serial":"2CF7F12010700041","port":2,"counter":1119,"confirmed":true,"payload_raw":"AQEQYG0AAAECEOj9AACWSA==","payload_fields":{"err":0,"messages":[{"measurementId":4097,"measurementValue":28,"type":"report_telemetry"},{"measurementId":4098,"measurementValue":65,"type":"report_telemetry"}],"payload":"010110606D0000010210E8FD00009648","valid":true},"metadata":{"time":"2020-03-13T09:09:45.834032725Z","frequency":867.3,"modulation":"LORA","data_rate":"SF7BW125","airtime":66816000,"coding_rate":"4/5","gateways":[{"gtw_id":"eui-2cf7f11014300001","timestamp":1779605971,"time":"2020-03-13T09:09:45.672666033Z","channel":4,"rssi":-66,"snr":8.8,"rf_chain":0}]}}
```

## Reference

How many message types and what's the structure of each message type?

We will document the latest message types in the comment header of the script. Please check out [here](https://github.com/Seeed-Solution/TTN-Payload-Decoder/blob/master/decoder.js#L1).