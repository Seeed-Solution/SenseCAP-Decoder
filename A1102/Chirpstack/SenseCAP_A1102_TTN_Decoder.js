"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function Decode(fPort, bytes, variables) {
  var bytesString = bytes2HexString(bytes).toLocaleUpperCase();
  var fport = parseInt(fPort);
  var result = {
    'err': 0,
    'payload': bytesString,
    'valid': true,
    messages: []
  };
  var splitArray = dataSplit(bytesString);
  // data decoder
  var decoderArray = [];
  var modelName = 'unknown model';
  var classes = null;
  var _iterator = _createForOfIteratorHelper(splitArray),
      _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var fragment = _step.value;
      if (fragment.dataId !== '33') {
        continue;
      }
      fragment.modelId = parseInt(loraWANV2DataFormat(fragment.dataValue.substring(12, 20), 1000)) - 1000000;
      var modelInfo = getModelInfo(fragment.modelId + '');
      if (modelInfo) {
        modelName = modelInfo.modelName;
        classes = modelInfo.classes;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  for (var i = 0; i < splitArray.length; i++) {
    var item = splitArray[i];
    var dataId = item.dataId;
    var dataValue = item.dataValue;
    var messages = dataIdAndDataValueJudge(dataId, dataValue, modelName, classes);
    if (!messages || messages.length === 0) {
      continue;
    }
    decoderArray.push(messages);
  }
  result.messages = decoderArray;
  return {
    data: result
  };
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit(bytes) {
  var frameArray = [];
  for (var i = 0; i < bytes.length; i++) {
    var remainingValue = bytes;
    var dataId = remainingValue.substring(0, 2);
    var dataValue = void 0;
    var dataObj = {};
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
        dataValue = remainingValue.substring(2, 22);
        bytes = remainingValue.substring(22);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '02':
        dataValue = remainingValue.substring(2, 18);
        bytes = remainingValue.substring(18);
        dataObj = {
          'dataId': '02',
          'dataValue': dataValue
        };
        break;
      case '03':
      case '06':
        dataValue = remainingValue.substring(2, 4);
        bytes = remainingValue.substring(4);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '05':
      case '34':
        dataValue = bytes.substring(2, 10);
        bytes = remainingValue.substring(10);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        dataValue = bytes.substring(2, 20);
        bytes = remainingValue.substring(20);
        dataObj = {
          'dataId': dataId,
          'dataValue': dataValue
        };
        break;
      default:
        dataValue = '9';
        break;
    }
    if (dataValue.length < 2) {
      break;
    }
    frameArray.push(dataObj);
  }
  return frameArray;
}
function dataIdAndDataValueJudge(dataId, dataValue, modelName, classes) {
  var messages = [];
  var dataOne;
  var dataTwo;
  switch (dataId) {
    case '01':
      break;
    case '02':
      break;
    case '03':
      break;
    case '04':
      break;
    case '05':
      break;
    case '06':
      var errorCode = dataValue;
      var descZh;
      switch (errorCode) {
        case '00':
          descZh = 'CCL_SENSOR_ERROR_NONE';
          break;
        case '01':
          descZh = 'CCL_SENSOR_NOT_FOUND';
          break;
        case '02':
          descZh = 'CCL_SENSOR_WAKEUP_ERROR';
          break;
        case '03':
          descZh = 'CCL_SENSOR_NOT_RESPONSE';
          break;
        case '04':
          descZh = 'CCL_SENSOR_DATA_EMPTY';
          break;
        case '05':
          descZh = 'CCL_SENSOR_DATA_HEAD_ERROR';
          break;
        case '06':
          descZh = 'CCL_SENSOR_DATA_CRC_ERROR';
          break;
        case '07':
          descZh = 'CCL_SENSOR_DATA_B1_NO_VALID';
          break;
        case '08':
          descZh = 'CCL_SENSOR_DATA_B2_NO_VALID';
          break;
        case '09':
          descZh = 'CCL_SENSOR_RANDOM_NOT_MATCH';
          break;
        case '0A':
          descZh = 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED';
          break;
        case '0B':
          descZh = 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED';
          break;
        case '0C':
          descZh = 'CCL_SENSOR_DATA_VALUE_HI';
          break;
        case '0D':
          descZh = 'CCL_SENSOR_DATA_VALUE_LOW';
          break;
        case '0E':
          descZh = 'CCL_SENSOR_DATA_VALUE_MISSED';
          break;
        case '0F':
          descZh = 'CCL_SENSOR_ARG_INVAILD';
          break;
        case '10':
          descZh = 'CCL_SENSOR_RS485_MASTER_BUSY';
          break;
        case '11':
          descZh = 'CCL_SENSOR_RS485_REV_DATA_ERROR';
          break;
        case '12':
          descZh = 'CCL_SENSOR_RS485_REG_MISSED';
          break;
        case '13':
          descZh = 'CCL_SENSOR_RS485_FUN_EXE_ERROR';
          break;
        case '14':
          descZh = 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR';
          break;
        case '15':
          descZh = 'CCL_SENSOR_CONFIG_ERROR';
          break;
        case 'FF':
          descZh = 'CCL_SENSOR_DATA_ERROR_UNKONW';
          break;
        default:
          descZh = 'CC_OTHER_FAILED';
          break;
      }
      messages = [{
        measurementId: '4101',
        type: 'sensor_error_event',
        errCode: errorCode,
        descZh: descZh
      }];
      break;
    case '10':
      var statusValue = dataValue.substring(0, 2);
      var _loraWANV2BitDataForm = loraWANV2BitDataFormat(statusValue),
          status = _loraWANV2BitDataForm.status,
          type = _loraWANV2BitDataForm.type;
      var sensecapId = dataValue.substring(2);
      messages = [{
        status: status,
        channelType: type,
        sensorEui: sensecapId
      }];
      break;
    case '30':
    case '31':
      var channelInfoOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      dataOne = loraWANV2DataFormat(dataValue.substring(4, 12));
      dataTwo = loraWANV2DataFormat(dataValue.substring(12, 20));
      if (parseInt(dataOne) !== -1000) {
        if (modelName === 'Digital Meter Electricity') {
          var classId = parseInt(dataOne / 1000);
          var targetName = classes !== null && classes[classId + ''] ? classes[classId + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000,
            measurementId: '4165',
            type: "".concat(targetName, " value")
          });
        } else {
          var _classId = parseInt(dataOne / 1000);
          var _targetName = classes !== null && classes[_classId + ''] ? classes[_classId + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000 + 0.01,
            measurementId: '4165',
            type: "".concat(_targetName, " Conf")
          });
        }
      }
      if (parseInt(dataTwo) !== -1000) {
        if (modelName === 'Digital Meter Electricity') {
          var _classId2 = parseInt(dataTwo / 1000);
          var _targetName2 = classes !== null && classes[_classId2 + ''] ? classes[_classId2 + ''] : 'unknown';
          messages.push({
            measurementValue: dataTwo / 1000,
            measurementId: '4166',
            type: "".concat(_targetName2, " value")
          });
        } else {
          var _classId3 = parseInt(dataTwo / 1000);
          var _targetName3 = classes !== null && classes[_classId3 + ''] ? classes[_classId3 + ''] : 'unknown';
          messages.push({
            measurementValue: dataTwo / 1000 + 0.01,
            measurementId: '4166',
            type: "".concat(_targetName3, " Conf")
          });
        }
      }
      break;
    case '32':
      var channelInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      dataOne = loraWANV2DataFormat(dataValue.substring(2, 10));
      dataTwo = loraWANV2DataFormat(dataValue.substring(10, 18));
      if (parseInt(dataOne) !== -1000) {
        if (modelName === 'Digital Meter Electricity') {
          var _classId4 = parseInt(dataOne / 1000);
          var _targetName4 = classes !== null && classes[_classId4 + ''] ? classes[_classId4 + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000,
            measurementId: 4164 + parseInt(channelInfoTwo.one) + '',
            type: "".concat(_targetName4, " value")
          });
        } else {
          var _classId5 = parseInt(dataOne / 1000);
          var _targetName5 = classes !== null && classes[_classId5 + ''] ? classes[_classId5 + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000 + 0.01,
            measurementId: 4164 + parseInt(channelInfoTwo.one) + '',
            type: "".concat(_targetName5, " Conf")
          });
        }
      }
      if (parseInt(dataTwo) !== -1000) {
        if (modelName === 'Digital Meter Electricity') {
          var _classId6 = parseInt(dataTwo / 1000);
          var _targetName6 = classes !== null && classes[_classId6 + ''] ? classes[_classId6 + ''] : 'unknown';
          messages.push({
            measurementValue: dataTwo / 1000,
            measurementId: 4164 + parseInt(channelInfoTwo.two) + '',
            type: "".concat(_targetName6, " value")
          });
        } else {
          var _classId7 = parseInt(dataTwo / 1000);
          var _targetName7 = classes !== null && classes[_classId7 + ''] ? classes[_classId7 + ''] : 'unknown';
          messages.push({
            measurementValue: dataTwo / 1000 + 0.01,
            measurementId: 4164 + parseInt(channelInfoTwo.two) + '',
            type: "".concat(_targetName7, " Conf")
          });
        }
      }
      break;
    case '33':
      var channelInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2));
      dataOne = loraWANV2DataFormat(dataValue.substring(4, 12));
      dataTwo = loraWANV2DataFormat(dataValue.substring(12, 20));
      if (parseInt(dataOne) !== -1000) {
        if (modelName === 'Digital Meter Electricity') {
          var _classId8 = parseInt(dataOne / 1000);
          var _targetName8 = classes !== null && classes[_classId8 + ''] ? classes[_classId8 + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000,
            measurementId: 4164 + parseInt(channelInfoThree.one) + '',
            type: "".concat(_targetName8, " value")
          });
        } else {
          var _classId9 = parseInt(dataOne / 1000);
          var _targetName9 = classes !== null && classes[_classId9 + ''] ? classes[_classId9 + ''] : 'unknown';
          messages.push({
            measurementValue: dataOne / 1000 + 0.01,
            measurementId: 4164 + parseInt(channelInfoThree.one) + '',
            type: "".concat(_targetName9, " Conf")
          });
        }
      }
      if (parseInt(dataTwo) !== -1000 && parseInt(channelInfoThree.two) === 10) {
        messages.push({
          measurementValue: modelName,
          measurementId: 4164 + parseInt(channelInfoThree.two) + '',
          type: "Model Type"
        });
      }
      break;
    case '34':
      break;
    case '35':
    case '36':
      break;
    case '37':
      break;
    case '38':
      break;
    case '39':
      var electricityWhetherTD = dataValue.substring(0, 2);
      var hwvTD = dataValue.substring(2, 6);
      var bdvTD = dataValue.substring(6, 10);
      var sensorAcquisitionIntervalTD = dataValue.substring(10, 14);
      var gpsAcquisitionIntervalTD = dataValue.substring(14, 18);
      messages = [{
        'Battery(%)': loraWANV2DataFormat(electricityWhetherTD),
        'Hardware Version': "".concat(loraWANV2DataFormat(hwvTD.substring(0, 2)), ".").concat(loraWANV2DataFormat(hwvTD.substring(2, 4))),
        'Firmware Version': "".concat(loraWANV2DataFormat(bdvTD.substring(0, 2)), ".").concat(loraWANV2DataFormat(bdvTD.substring(2, 4))),
        'measureInterval': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
        'thresholdMeasureInterval': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD))
      }];
      break;
    case '40':
    case '41':
      break;
    case '42':
      break;
    case '43':
    case '44':
      break;
    case '45':
      break;
    default:
      break;
  }
  return messages;
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat(str) {
  var divisor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === '1') {
    var arr = str2.split('');
    var reverseArr = arr.map(function (item) {
      if (parseInt(item) === 1) {
        return 0;
      } else {
        return 1;
      }
    });
    str2 = parseInt(reverseArr.join(''), 2) + 1;
    return parseFloat('-' + str2 / divisor);
  }
  return parseInt(str2, 2) / divisor;
}

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform(data) {
  var dataArray = [];
  for (var i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  // array of hex
  return dataArray;
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary(arr) {
  var binaryData = arr.map(function (item) {
    var data = parseInt(item, 16).toString(2);
    var dataLength = data.length;
    if (data.length !== 8) {
      for (var i = 0; i < 8 - dataLength; i++) {
        data = "0" + data;
      }
    }
    return data;
  });
  var ret = binaryData.toString().replace(/,/g, '');
  return ret;
}

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var channel = parseInt(str2.substring(0, 4), 2);
  var status = parseInt(str2.substring(4, 5), 2);
  var type = parseInt(str2.substring(5), 2);
  return {
    channel: channel,
    status: status,
    type: type
  };
}

/**
 * channel info
 * @param str
 * @returns {{channelTwo: number, channelOne: number}}
 */
function loraWANV2ChannelBitFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var one = parseInt(str2.substring(0, 4), 2);
  var two = parseInt(str2.substring(4, 8), 2);
  var resultInfo = {
    one: one,
    two: two
  };
  return resultInfo;
}

/**
 * data log status bit
 * @param str
 * @returns {{total: number, level: number, isTH: number}}
 */
function loraWANV2DataLogBitFormat(str) {
  var strReverse = bigEndianTransform(str);
  var str2 = toBinary(strReverse);
  var isTH = parseInt(str2.substring(0, 1), 2);
  var total = parseInt(str2.substring(1, 5), 2);
  var left = parseInt(str2.substring(5), 2);
  var resultInfo = {
    isTH: isTH,
    total: total,
    left: left
  };
  return resultInfo;
}
function bytes2HexString(arrBytes) {
  var str = '';
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
    if (num < 0) {
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length === 1) {
      tmp = '0' + tmp;
    }
    str += tmp;
  }
  return str;
}
function getModelInfo(modelId) {
  var modelTable = {
    '60086': {
      modelName: 'Person Detection--Swift YOLO',
      task: 'Detection',
      classes: {
        "0": "person"
      }
    },
    '60113': {
      modelName: 'Digital Meter Electricity',
      task: 'Detection',
      classes: {
        "0": "zero",
        "1": "one",
        "2": "two",
        "3": "three",
        "4": "four",
        "5": "five",
        "6": "six",
        "7": "seven",
        "8": "eight",
        "9": "nine"
      }
    },
    '60242': {
      modelName: 'Person Detection',
      task: 'Detection',
      classes: {
        "0": "Person"
      }
    }
  };
  return modelTable[modelId];
}