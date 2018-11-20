import React, { PureComponent } from "react";
import { Dialog } from "@material-ui/core";
import logo from "../../assets/loading.png";

export default class Loading extends PureComponent {
  render() {
    return (
      <Dialog className="loading-modal" open={this.props.show}>
        <img src={logo} height={250} alt="" />
      </Dialog>
    );
  }
}
