import _ from 'lodash';
import * as requestService from './request';
import { Base64 } from '../common/base64';
import * as storageService from './storage';
import { authData, storageKey, pageSize } from '../config';
import dataApi from '../config/api';
import * as StringUtil from '../util/stringutil';
import * as DataTrans from '../util/datatrans';
import * as Encrypt from '../util/encrypt';
import * as UUID from '../util/uuid';
import * as SpxCipherService from './SpxCipherService';

// 获取登录用户名加密hash盐
export function getUserPwdSalt() {
  let fetchApi = dataApi.spxGuys.salt;
  return requestService.get(fetchApi);
}

// 获取用户密码加密hash盐
export function getUserNoSalt() {
  let fetchApi = dataApi.spxGuys.usernosalt;
  return requestService.get(fetchApi);
}

// 账号校验
export function usernoValid(userno) {
  let fetchApi = dataApi.spxGuys.usernoValid;
  return requestService.get(fetchApi);
}

// 用户注册
export function guysRegist(userInfo) {
  // 数据校验
  if (userInfo) {
    if (!StringUtil.isEmpty(userInfo.encryptionSalt)) {
      return new Promise((resolve, reject) => {
        reject('注册失败，您可以尝试重新注册一下。');
      });
    }
    if (!StringUtil.isEmpty(userInfo.signinPwd)) {
      return new Promise((resolve, reject) => {
        reject('注册失败，您可以尝试重新注册一下。');
      });
    }
    if (!StringUtil.isEmpty(userInfo.usernoSalt)) {
      return new Promise((resolve, reject) => {
        reject('注册失败，您可以尝试重新注册一下。');
      });
    }
    if (!StringUtil.isEmpty(userInfo.userFirstName)) {
      return new Promise((resolve, reject) => {
        reject('姓氏可能没有填写，请确认一下。');
      });
    }
    if (!StringUtil.isEmpty(userInfo.userLastName)) {
      return new Promise((resolve, reject) => {
        reject('名字可能没有填写，请确认一下。');
      });
    }
    if (!StringUtil.isEmpty(userInfo.phoneNo)) {
      return new Promise((resolve, reject) => {
        reject('电话可能没有填写，请确认一下。');
      });
    }
    userInfo.signinCode = Encrypt.encryptPBKDF2(userInfo.phoneNo, userInfo.usernoSalt);// 登录标识
  }
  // 将数据转成json字符串
  let jsonData = JSON.stringify(userInfo);
  return new Promise(function(resolve, reject){
    // 使用用rsa公钥加密 aes密钥
    // 获取rsa公钥
    SpxCipherService.getRSAPublicKey().then(function (data){
      // 获取rsa公钥成功
      let rsaPubKey = data.repData.publicKey;// 公钥
      let cacheKey = data.repData.cacheKey;// 对应缓存key
      // 对数据进行aes加密
      let encryptedObj = Encrypt.encryptAESGenerateSK(jsonData);
      if (encryptedObj.success) {
        // 使用rsa公钥对aes密钥加密
        let aesKey = Encrypt.encryptRSAByPubKey(rsaPubKey, encryptedObj.sk);
        let sendObj = {};
        DataTrans.concatSendObjByObj(sendObj, {
          jsonData: encryptedObj.encryptedData,
          sk: aesKey,
          ck: cacheKey
        }, 'reqData');
        let formData = new FormData();
        let proptNames = Object.keys(sendObj);
        for (let i=0; i<proptNames.length; i++) {
          formData.append(proptNames[i], sendObj[proptNames[i]]);
        }
        let headers = {
          'Content-type': 'multipart/form-data'
        };
        let fetchApi = dataApi.spxGuys.guysRegist;
        requestService.post(fetchApi, formData, headers).then(function (data){
          console.log(data);
          resolve(data);
        }, function (data){
          console.log(data);
          reject(data);
        });
      } else {
        // 加密失败
        reject('数据加密失败');
      }
    }, function (data){
      // 获取rsa公钥失败
      reject(data);
    });
  });
}
