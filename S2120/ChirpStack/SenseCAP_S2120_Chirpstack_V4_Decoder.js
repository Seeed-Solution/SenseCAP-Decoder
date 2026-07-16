/**
 * SenseCAP S2120 payload decoder for ChirpStack v4.
 *
 * ChirpStack v4 calls decodeUplink(input).
 * The original Decode(fPort, bytes, variables) function is retained internally
 * so the manufacturer's decoding logic remains unchanged.
 */
function decodeUplink(input) {
  try {
    return Decode(
      input.fPort,
      input.bytes,
      input.variables || {}
    );
  } catch (error) {
    return {
      data: {},
      errors: [
        String(error && error.message ? error.message : error)
      ]
    };
  }
}

/**
 * Original decoder entry point used internally by decodeUplink.
 *
 * @param {number} fPort LoRaWAN frame port.
 * @param {number[]} bytes Payload bytes.
 * @param {object} variables Optional codec variables.
 * @returns {{data: object}}
 */
function Decode(fPort, bytes, variables) {
  var payloadHex = bytes2HexString(bytes).toUpperCase();

  var result = {
    err: 0,
    payload: payloadHex,
    valid: true,
    messages: []
  };

  var splitArray = dataSplit(payloadHex);
  var decoderArray = [];

  for (var i = 0; i < splitArray.length; i++) {
    var item = splitArray[i];

    var messages = dataIdAndDataValueJudge(
      item.dataId,
      item.dataValue
    );

    decoderArray.push(messages);
  }

  result.messages = decoderArray;

  return {
    data: result
  };
}

/**
 * Splits the hexadecimal payload into data blocks.
 *
 * @param {string} bytes Payload represented as a hexadecimal string.
 * @returns {object[]} Parsed data blocks.
 */
function dataSplit(bytes) {
  var frameArray = [];

  while (bytes.length >= 2) {
    var remainingValue = bytes;
    var dataId = remainingValue.substring(0, 2).toLowerCase();
    var dataValue;
    var blockLength;

    switch (dataId) {
      case '01':
      case '20':
      case '21':
      case '30':
      case '31':
      case '33':
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
      case '4a':
        blockLength = 22;
        break;

      case '02':
      case '4b':
        blockLength = 18;
        break;

      case '03':
      case '06':
        blockLength = 4;
        break;

      case '05':
      case '34':
        blockLength = 10;
        break;

      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        blockLength = 20;
        break;

      case '4c':
        blockLength = 14;
        break;

      default:
        return frameArray;
    }

    if (remainingValue.length < blockLength) {
      break;
    }

    dataValue = remainingValue.substring(2, blockLength);
    bytes = remainingValue.substring(blockLength);

    frameArray.push({
      dataId: dataId,
      dataValue: dataValue
    });
  }

  return frameArray;
}

/**
 * Decodes one data block based on its data identifier.
 *
 * @param {string} dataId Data identifier.
 * @param {string} dataValue Hexadecimal block data.
 * @returns {object[]} Decoded measurements or status messages.
 */
function dataIdAndDataValueJudge(dataId, dataValue) {
  var messages = [];

  var temperature;
  var humidity;
  var illumination;
  var uv;
  var windSpeed;
  var windDirection;
  var rainfall;
  var airPressure;
  var peakWind;
  var rainAccumulation;

  switch (dataId) {
    case '01':
    case '4a':
      temperature = dataValue.substring(0, 4);
      humidity = dataValue.substring(4, 6);
      illumination = dataValue.substring(6, 14);
      uv = dataValue.substring(14, 16);
      windSpeed = dataValue.substring(16, 20);

      messages = [
        {
          measurementValue: loraWANV2DataFormat(
            temperature,
            10
          ),
          measurementId: '4097',
          type: 'Air Temperature'
        },
        {
          measurementValue: loraWANV2DataFormat(
            humidity
          ),
          measurementId: '4098',
          type: 'Air Humidity'
        },
        {
          measurementValue: loraWANV2DataFormat(
            illumination
          ),
          measurementId: '4099',
          type: 'Light Intensity'
        },
        {
          measurementValue: loraWANV2DataFormat(
            uv,
            10
          ),
          measurementId: '4190',
          type: 'UV Index'
        },
        {
          measurementValue: loraWANV2DataFormat(
            windSpeed,
            10
          ),
          measurementId: '4105',
          type: 'Wind Speed'
        }
      ];
      break;

    case '02':
    case '4b':
      windDirection = dataValue.substring(0, 4);
      rainfall = dataValue.substring(4, 12);
      airPressure = dataValue.substring(12, 16);

      messages = [
        {
          measurementValue: loraWANV2DataFormat(
            windDirection
          ),
          measurementId: '4104',
          type: 'Wind Direction Sensor'
        },
        {
          measurementValue: loraWANV2DataFormat(
            rainfall,
            1000
          ),
          measurementId: '4113',
          type: 'Rain Gauge'
        },
        {
          measurementValue: loraWANV2DataFormat(
            airPressure,
            0.1
          ),
          measurementId: '4101',
          type: 'Barometric Pressure'
        }
      ];
      break;

    case '03':
      messages = [
        {
          'Battery(%)': loraWANV2DataFormat(
            dataValue
          )
        }
      ];
      break;

    case '04':
      var batteryLevel = dataValue.substring(0, 2);
      var hardwareVersion = dataValue.substring(2, 6);
      var firmwareVersion = dataValue.substring(6, 10);

      var sensorAcquisitionInterval =
        dataValue.substring(10, 14);

      var gpsAcquisitionInterval =
        dataValue.substring(14, 18);

      messages = [
        {
          'Battery(%)': loraWANV2DataFormat(
            batteryLevel
          ),

          'Hardware Version':
            String(
              loraWANV2DataFormat(
                hardwareVersion.substring(0, 2)
              )
            ) +
            '.' +
            String(
              loraWANV2DataFormat(
                hardwareVersion.substring(2, 4)
              )
            ),

          'Firmware Version':
            String(
              loraWANV2DataFormat(
                firmwareVersion.substring(0, 2)
              )
            ) +
            '.' +
            String(
              loraWANV2DataFormat(
                firmwareVersion.substring(2, 4)
              )
            ),

          measureInterval:
            parseInt(
              loraWANV2DataFormat(
                sensorAcquisitionInterval
              ),
              10
            ) * 60,

          gpsInterval:
            parseInt(
              loraWANV2DataFormat(
                gpsAcquisitionInterval
              ),
              10
            ) * 60
        }
      ];
      break;

    case '05':
      var measureInterval =
        dataValue.substring(0, 4);

      var gpsInterval =
        dataValue.substring(4, 8);

      messages = [
        {
          measureInterval:
            parseInt(
              loraWANV2DataFormat(
                measureInterval
              ),
              10
            ) * 60,

          gpsInterval:
            parseInt(
              loraWANV2DataFormat(
                gpsInterval
              ),
              10
            ) * 60
        }
      ];
      break;

    case '06':
      var errorCode = dataValue;
      var errorDescription;

      switch (errorCode) {
        case '00':
          errorDescription =
            'CCL_SENSOR_ERROR_NONE';
          break;

        case '01':
          errorDescription =
            'CCL_SENSOR_NOT_FOUND';
          break;

        case '02':
          errorDescription =
            'CCL_SENSOR_WAKEUP_ERROR';
          break;

        case '03':
          errorDescription =
            'CCL_SENSOR_NOT_RESPONSE';
          break;

        case '04':
          errorDescription =
            'CCL_SENSOR_DATA_EMPTY';
          break;

        case '05':
          errorDescription =
            'CCL_SENSOR_DATA_HEAD_ERROR';
          break;

        case '06':
          errorDescription =
            'CCL_SENSOR_DATA_CRC_ERROR';
          break;

        case '07':
          errorDescription =
            'CCL_SENSOR_DATA_B1_NO_VALID';
          break;

        case '08':
          errorDescription =
            'CCL_SENSOR_DATA_B2_NO_VALID';
          break;

        case '09':
          errorDescription =
            'CCL_SENSOR_RANDOM_NOT_MATCH';
          break;

        case '0A':
          errorDescription =
            'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED';
          break;

        case '0B':
          errorDescription =
            'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED';
          break;

        case '0C':
          errorDescription =
            'CCL_SENSOR_DATA_VALUE_HI';
          break;

        case '0D':
          errorDescription =
            'CCL_SENSOR_DATA_VALUE_LOW';
          break;

        case '0E':
          errorDescription =
            'CCL_SENSOR_DATA_VALUE_MISSED';
          break;

        case '0F':
          errorDescription =
            'CCL_SENSOR_ARG_INVAILD';
          break;

        case '10':
          errorDescription =
            'CCL_SENSOR_RS485_MASTER_BUSY';
          break;

        case '11':
          errorDescription =
            'CCL_SENSOR_RS485_REV_DATA_ERROR';
          break;

        case '12':
          errorDescription =
            'CCL_SENSOR_RS485_REG_MISSED';
          break;

        case '13':
          errorDescription =
            'CCL_SENSOR_RS485_FUN_EXE_ERROR';
          break;

        case '14':
          errorDescription =
            'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR';
          break;

        case '15':
          errorDescription =
            'CCL_SENSOR_CONFIG_ERROR';
          break;

        case 'FF':
          errorDescription =
            'CCL_SENSOR_DATA_ERROR_UNKONW';
          break;

        default:
          errorDescription =
            'CC_OTHER_FAILED';
          break;
      }

      messages = [
        {
          measurementId: '4101',
          type: 'sensor_error_event',
          errCode: errorCode,
          descZh: errorDescription
        }
      ];
      break;

    case '10':
      var statusValue =
        dataValue.substring(0, 2);

      var bitData =
        loraWANV2BitDataFormat(statusValue);

      var sensecapId =
        dataValue.substring(2);

      messages = [
        {
          status: bitData.status,
          channelType: bitData.type,
          sensorEui: sensecapId
        }
      ];
      break;

    case '4c':
      peakWind =
        dataValue.substring(0, 4);

      rainAccumulation =
        dataValue.substring(4, 12);

      messages = [
        {
          measurementValue:
            loraWANV2DataFormat(
              peakWind,
              10
            ),
          measurementId: '4191',
          type: 'Peak Wind Gust'
        },
        {
          measurementValue:
            loraWANV2DataFormat(
              rainAccumulation,
              1000
            ),
          measurementId: '4213',
          type: 'Rain Accumulation'
        }
      ];
      break;

    default:
      break;
  }

  return messages;
}

/**
 * Converts a hexadecimal value to a signed numeric value.
 * Negative values are interpreted as two's complement.
 *
 * @param {string} str Hexadecimal value.
 * @param {number} divisor Scale divisor.
 * @returns {number} Decoded numeric value.
 */
function loraWANV2DataFormat(str, divisor) {
  if (divisor === undefined) {
    divisor = 1;
  }

  var byteArray =
    bigEndianTransform(str);

  var binaryString =
    toBinary(byteArray);

  if (binaryString.substring(0, 1) === '1') {
    var invertedBits =
      binaryString
        .split('')
        .map(function (item) {
          return parseInt(item, 10) === 1
            ? 0
            : 1;
        });

    var negativeValue =
      parseInt(
        invertedBits.join(''),
        2
      ) + 1;

    return -negativeValue / divisor;
  }

  return parseInt(binaryString, 2) / divisor;
}

/**
 * Splits a hexadecimal string into individual byte strings.
 *
 * @param {string} data Hexadecimal string.
 * @returns {string[]} Byte strings.
 */
function bigEndianTransform(data) {
  var dataArray = [];

  for (
    var i = 0;
    i < data.length;
    i += 2
  ) {
    dataArray.push(
      data.substring(i, i + 2)
    );
  }

  return dataArray;
}

/**
 * Converts hexadecimal byte strings to one binary string.
 *
 * @param {string[]} arr Hexadecimal byte strings.
 * @returns {string} Binary string.
 */
function toBinary(arr) {
  var binaryData = arr.map(
    function (item) {
      var data =
        parseInt(item, 16).toString(2);

      while (data.length < 8) {
        data = '0' + data;
      }

      return data;
    }
  );

  return binaryData.join('');
}

/**
 * Decodes sensor channel, status and type bits.
 *
 * @param {string} str Hexadecimal status byte.
 * @returns {{channel: number, status: number, type: number}}
 */
function loraWANV2BitDataFormat(str) {
  var binaryString =
    toBinary(
      bigEndianTransform(str)
    );

  return {
    channel: parseInt(
      binaryString.substring(0, 4),
      2
    ),

    status: parseInt(
      binaryString.substring(4, 5),
      2
    ),

    type: parseInt(
      binaryString.substring(5),
      2
    )
  };
}

/**
 * Decodes two channel values from one byte.
 * This helper is retained from the original manufacturer decoder.
 *
 * @param {string} str Hexadecimal channel byte.
 * @returns {{one: number, two: number}}
 */
function loraWANV2ChannelBitFormat(str) {
  var binaryString =
    toBinary(
      bigEndianTransform(str)
    );

  return {
    one: parseInt(
      binaryString.substring(0, 4),
      2
    ),

    two: parseInt(
      binaryString.substring(4, 8),
      2
    )
  };
}

/**
 * Decodes data-log status bits.
 * This helper is retained from the original manufacturer decoder.
 *
 * @param {string} str Hexadecimal data-log status byte.
 * @returns {{isTH: number, total: number, left: number}}
 */
function loraWANV2DataLogBitFormat(str) {
  var binaryString =
    toBinary(
      bigEndianTransform(str)
    );

  return {
    isTH: parseInt(
      binaryString.substring(0, 1),
      2
    ),

    total: parseInt(
      binaryString.substring(1, 5),
      2
    ),

    left: parseInt(
      binaryString.substring(5),
      2
    )
  };
}

/**
 * Converts a byte array to a hexadecimal string.
 *
 * @param {number[]} arrBytes Payload bytes.
 * @returns {string} Hexadecimal payload string.
 */
function bytes2HexString(arrBytes) {
  var str = '';

  for (
    var i = 0;
    i < arrBytes.length;
    i++
  ) {
    var value = arrBytes[i];

    if (value < 0) {
      value = 255 + value + 1;
    }

    var hex = value.toString(16);

    if (hex.length === 1) {
      hex = '0' + hex;
    }

    str += hex;
  }

  return str;
}
