import React, { Component } from 'react';
import ReactSwipes from 'react-swipes';
import Numeral from 'numeral';

export default class Rulers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: CONFIGS.repayDefaultTitle,
      fees: 0,
      data: [],
      rulerWidth: 9,
      isDefault: true
    };
  }

  componentWillReceiveProps(nextProps) {
    let currentPoint = this.getCurrentPoint(nextProps.list);
    this.setState({data: nextProps.list, fees: nextProps.list[currentPoint]});
  }

  componentDidUpdate() {
    this.resetContainer();
    // setTimeout(() => {
    //   let currentPoint = this.getCurrentPoint();
    //   this.refs.rulers.swipes.moveToPoint(currentPoint);
    // }, 3000);
  }

  resetContainer() {
    let totalWidth = this.state.data.length * this.state.rulerWidth;
    let rulerContainer = document.getElementsByClassName('crf-rulers')[0];
    let offsetValue = (totalWidth/2) - 10.5;
    rulerContainer.style.width = totalWidth + 'px';
    rulerContainer.style.marginLeft = offsetValue + 'px';
    rulerContainer.style.marginRight = offsetValue + 'px';
    rulerContainer.style.transform = `translate3d(-${totalWidth/2}px, 0, 0)`;
  }

  getCurrentPoint(data) {
    let currentData = data || this.state.data;
    let currentPoint = currentData.length / 2;
    (currentPoint < 1) && (currentPoint === 0);
    currentPoint = parseInt(currentPoint);
    return currentPoint;
  }

  handleDetails() {

  }

  handleReset() {
    let currentPoint = this.getCurrentPoint();
    this.setState({
      fees: this.state.data[currentPoint],
      title: CONFIGS.repayDefaultTitle,
      isDefault: true
    })
  }

  render() {
    const opt = {
      distance: this.state.rulerWidth, // 每次移动的距离，卡片的真实宽度，需要计算
      currentPoint: this.getCurrentPoint(),// 初始位置，默认从0即第一个元素开始
      swTouchend: (ev) => {
        let data = {
          moved: ev.moved,
          originalPoint: ev.originalPoint,
          newPoint: ev.newPoint,
          cancelled: ev.cancelled
        }
        this.setState({
          fees: this.state.data[ev.newPoint],
          title: CONFIGS.repayChangedTitle,
          isDefault: false
        })
      }
    };

    const ruler = (item, index) => {
      return (
        <div key={index} className="crf-ruler"></div>
      );
    };

    const {title, fees, isDefault} = this.state;
    const formatFees = Numeral(fees).format('0, 0.00');
    return (
      <section className="crf-swipes">
        <div className="crf-swipes-title">
          <span className="crf-swipes-title-text">{title}</span>
          {!isDefault &&
            <span className="crf-swipes-title-link">
              <a onClick={this.handleReset.bind(this)}></a>
            </span>
          }
        </div>
        <div className="crf-swipes-fees">
          <span className="crf-swipes-fees-text">{formatFees}</span>
          <span className="crf-swipes-fees-link">
            <a onClick={this.handleDetails.bind(this)}>明细</a>
          </span>
        </div>
        <div className="crf-swipes-content">
          <div className="crf-swipes-axis">
            <div className="crf-swipes-axis-inner"></div>
          </div>
          <div className="crf-swipes-rulers">
            {(this.state.data.length > 0) &&
              <ReactSwipes ref="rulers" className="crf-rulers" options={opt}>
                {this.state.data.map(ruler)}
              </ReactSwipes>
            }
          </div>
        </div>
        <div className="crf-swipes-description">左右滑动调整还款金额, 调整以50为单位</div>
      </section>
    )
  }
}