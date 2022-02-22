import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faPauseCircle,
  faPlusCircle,
  faMinusCircle,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import "./newApp.css";

// Accurate_Interval.js
// Thanks Squeege! For the elegant answer provided to this question:
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time).
const dateTime = function (fn, time) {
  var cancel, nextDate, timeout, wrapper;
  nextDate = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextDate += time;
    timeout = setTimeout(wrapper, nextDate - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextDate - new Date().getTime());
  return {
    cancel: cancel,
  };
};

class CountControl extends React.Component {
  render() {
    return (
      <div className="consoleDiv">
        <h2 id={this.props.titleID}>{this.props.title}</h2>
        <div className="consoleBtnsDiv">
          <button
            className="btn-level"
            id={this.props.minID}
            onClick={this.props.onClick}
            value="-"
          >
            <FontAwesomeIcon className="minusIcon" icon={faMinusCircle} />
          </button>
          <h3 className="count" id={this.props.lengthID}>
            {this.props.length}
          </h3>
          <button
            className="btn-level"
            id={this.props.addID}
            onClick={this.props.onClick}
            value="+"
          >
            <FontAwesomeIcon className="plusIcon" icon={faPlusCircle} />
          </button>
        </div>
      </div>
    );
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      btnState: faPlayCircle,
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
    };
    this.setBreakCount = this.setBreakCount.bind(this);
    this.setSessionCount = this.setSessionCount.bind(this);
    this.lengthControl = this.lengthControl.bind(this);
    this.timerControl = this.timerControl.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.decrementTimer = this.decrementTimer.bind(this);
    this.phaseControl = this.phaseControl.bind(this);
    this.playBeep = this.playBeep.bind(this);
    this.switchTimer = this.switchTimer.bind(this);
    this.clockify = this.clockify.bind(this);
    this.reset = this.reset.bind(this);
  }
  setBreakCount(e) {
    this.lengthControl(
      "brkLength",
      e.currentTarget.value,
      this.state.brkLength,
      "Session"
    );
  }
  setSessionCount(e) {
    this.lengthControl(
      "seshLength",
      e.currentTarget.value,
      this.state.seshLength,
      "Break"
    );
  }
  lengthControl(stateToChange, sign, currentLength, timerType) {
    if (this.state.timerState === "running") {
      return;
    }
    if (this.state.timerType === timerType) {
      if (sign === "-" && currentLength !== 1) {
        this.setState({ [stateToChange]: currentLength - 1 });
      } else if (sign === "+" && currentLength !== 60) {
        this.setState({ [stateToChange]: currentLength + 1 });
      }
    } else if (sign === "-" && currentLength !== 1) {
      this.setState({
        [stateToChange]: currentLength - 1,
        timer: currentLength * 60 - 60,
      });
    } else if (sign === "+" && currentLength !== 60) {
      this.setState({
        [stateToChange]: currentLength + 1,
        timer: currentLength * 60 + 60,
      });
    }
  }
  timerControl() {
    if (this.state.timerState === "stopped") {
      this.startTimer();
      this.setState({ timerState: "running", btnState: faPauseCircle });
    } else {
      this.setState({ timerState: "stopped", btnState: faPlayCircle });
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
    }
  }
  startTimer() {
    this.setState({
      intervalID: dateTime(() => {
        this.decrementTimer();
        this.phaseControl();
      }, 1000),
    });
  }
  decrementTimer() {
    this.setState({ timer: this.state.timer - 1 });
  }
  phaseControl() {
    let timer = this.state.timer;
    this.playBeep(timer);
    if (timer < 0) {
      if (this.state.intervalID) {
        this.state.intervalID.cancel();
      }
      if (this.state.timerType === "Session") {
        this.startTimer();
        this.switchTimer(this.state.brkLength * 60, "Break");
      } else {
        this.startTimer();
        this.switchTimer(this.state.seshLength * 60, "Session");
      }
    }
  }

  playBeep(_timer) {
    if (_timer === 0) {
      this.audioBeep.play();
    }
  }
  switchTimer(num, str) {
    this.setState({
      timer: num,
      timerType: str,
    });
  }
  clockify() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + ":" + seconds;
  }
  reset() {
    this.setState({
      brkLength: 5,
      seshLength: 25,
      timerState: "stopped",
      timerType: "Session",
      timer: 1500,
      intervalID: "",
    });
    if (this.state.intervalID) {
      this.state.intervalID.cancel();
    }
    this.audioBeep.pause();
    this.audioBeep.currentTime = 0;
  }
  render() {
    return (
      <div>
        <h1 className="appHeading">POMODORO CLOCK</h1>
        <div className="clockDiv">
          <div className="controlDiv">
            <CountControl
              addID="break-increment"
              length={this.state.brkLength}
              lengthID="break-length"
              minID="break-decrement"
              onClick={this.setBreakCount}
              title="Break Length"
              titleID="break-label"
            />
            <CountControl
              addID="session-increment"
              length={this.state.seshLength}
              lengthID="session-length"
              minID="session-decrement"
              onClick={this.setSessionCount}
              title="Session Length"
              titleID="session-label"
            />
          </div>

          <div className="timer">
            <div className="timerDiv">
              <h2 className="timerLabel" id="timer-label">
                {this.state.timerType}
              </h2>
              <h3 id="time-left" className="timerCount">
                {this.clockify()}
              </h3>
            </div>
          </div>

          <div className="controlsDiv">
            <button
              id="start_stop"
              onClick={this.timerControl}
              className="startStopBtn"
            >
              <FontAwesomeIcon
                icon={this.state.btnState}
                className="playPauseBtn"
              />
            </button>
            <button id="reset" onClick={this.reset} className="resetBtn">
              <FontAwesomeIcon icon={faRotate} className="rotateBtn" />
            </button>
          </div>
          <audio
            id="beep"
            preload="auto"
            ref={(audio) => {
              this.audioBeep = audio;
            }}
            src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
          />
        </div>
      </div>
    );
  }
}

export default Timer;
