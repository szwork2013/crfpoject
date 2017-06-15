import React, {Component} from 'react';
import {Picker, List, Toast} from 'antd-mobile';
import {createForm} from 'rc-form';
//const doc=document;


class SelectCity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentWillMount() {
    this.requireJson();
  }

  componentDidMount() {
    //this.props.getElMethod(this.refs.refPicker);
  }

  requireJson() {
    let allData = JSON.parse(localStorage.getItem('CRF_provinceData'));

    if ((!allData) || cityDataVERSION != localStorage.getItem('CRF_cityDataVersion')) {
      require.ensure([], (require)=> {
        let data = require('../../../json/result.json');
        localStorage.setItem('CRF_provinceData', JSON.stringify(data));
        this.setState({
          data: data
        });
      });
      localStorage.setItem('CRF_cityDataVersion', cityDataVERSION);
    } else {
      this.setState({
        data: allData
      });
    }
  }

  onPickerChange(val) {
    this.props.getSelectVal(val);
    /*console.log(this.props);*/
  }

  render() {
    let district = this.state.data;
    const {getFieldProps} = this.props.form;
    return (<div>
      <List className="picker-list">
        <Picker cols="2" extra="开户行所在地" data={district} title="选择地区"
                onPickerChange={this.onPickerChange.bind(this)} {...getFieldProps('district')} >
          <List.Item arrow="horizontal">位置</List.Item>
        </Picker>
      </List>
    </div>);
  }
}

const CityWrapper = createForm()(SelectCity);

export default CityWrapper;