/**
 * Created by Icey on 4/11/16.
 */
'use strict';

import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, RefreshControl, ScrollView, ToastAndroid, Image, Dimensions, PixelRatio, Alert, AlertIOS} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import px2dp from '../util/px2dp';
import theme from '../config/theme';
import SearchBar from '../component/SearchBar';
import Swiper from 'react-native-swiper';
import UserListView from '../component/UserListView';
import MainPage from './MainPage';

export default class GuysFragment extends Component{
  constructor(props){
      super(props);
      this.state = {
          refreshing: true,
          loadedData: false,
          dataBlob: []
      }
  }

  render(){
      return(
          <View style={styles.container}>
              <SearchBar onPress={this._searchButtonCallback.bind(this)}/>
              <ScrollView
                  refreshControl={
                      <RefreshControl
                          refreshing={this.state.refreshing}
                          onRefresh={this._onRefresh.bind(this)}
                          colors={['red','#ffd500','#0080ff','#99e600']}
                          tintColor={theme.themeColor}
                          title="Loading..."
                          titleColor={theme.themeColor}
                      />
                  }>
                  { this._renderListView() }
              </ScrollView>
              <ActionButton buttonColor={theme.themeColor}
                            active={true}
                            degrees={0}
                            icon={<Icon name="md-add" style={styles.actionButtonIcon} />}
                            onPress={this._addClickCallback.bind(this)}>
              </ActionButton>
              <ActionButton buttonColor={theme.themeColor}
                            active={true}
                            degrees={0}
                            position="left"
                            icon={<Icon name="md-add" style={styles.actionButtonIcon} />}
                            onPress={this._testBtnClickCallback.bind(this)}>
              </ActionButton>
          </View>
      );
  }

  _testBtnClickCallback() {
      MainPage.switchToGuysEntrancePage();
  }

  _addClickCallback() {
      MainPage.switchToGuysEntrancePage();
  }

  _onRefresh() {
      this.setState({refreshing: true});
      //this._fetchData();
  }

  _searchButtonCallback(){

  }

  _renderListView(){
      if(!this.state.refreshing || this.state.loadedData) {
          return (
              <UserListView isRenderHeader={false} contents={this.state.dataBlob} />
          );
      }
  }

  _fetchData(){
      fetch('http://gold.xitu.io/api/v1/hot/57fa525a0e3dd90057c1e04d/android')
          .then((response) => response.json())
          .then((responseData) => {
              let entry = responseData.rows;
              var dataBlob = [];

              for(let i in entry){
                  let itemInfo = {
                      userName: entry[i].userName, // 用户名
                      userCode: entry[i].userCode, // 用户编号
                      excDays: entry[i].excDays ? entry[i].excDays : 0, // 训练天数
                      latelyDate: entry[i].latelyDate ? entry[i].latelyDate : 0, // 最近训练日期
                      portrait: entry[i].portrait ?  entry[i].portrait : null // 头像
                  }
                  dataBlob.push(itemInfo);
              }

              this.setState({
                  dataBlob: dataBlob,
                  loadedData: true,
                  refreshing: false
              });
          }).done();

  }

  componentDidMount(){
      //this._fetchData();
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: theme.pageBackgroundColor,
      marginBottom: px2dp(62)
  },
  actionButtonIcon: {
      fontSize: 28,
      height: 30,
      color: 'white'
  }
});
