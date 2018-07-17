import React, { Component } from "react";
import { Dialog, DialogTitle, DialogContent } from "@material-ui/core";

export default class SettingsDialog extends Component {
  render() {
    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.toggleSettingsMenu}
        disableRestoreFocus
      >
        <DialogTitle>Lorem ipsum dolor sit amet.</DialogTitle>
        <DialogContent>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Neque, qui!
        </DialogContent>
      </Dialog>
    );
  }
}
