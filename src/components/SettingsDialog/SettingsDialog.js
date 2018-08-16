import React, { PureComponent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Button,
  IconButton
} from "@material-ui/core";

import { Accessibility } from "@material-ui/icons";

export default class SettingsDialog extends PureComponent {
  state = {
    showTooltip: false
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const { showTooltip } = this.state;
    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.toggleSettingsMenu}
        disableRestoreFocus
      >
        <DialogTitle>Lorem ipsum dolor sit amet.</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={showTooltip}
                name="showTooltip"
                onChange={this.onChange}
              />
            }
            label="Show tooltips"
          />
          <br />
          <FormControlLabel
            control={
              <IconButton color="inherit" onClick={this.props.toggleTypeDialog}>
                <Accessibility />
              </IconButton>
            }
            label="Toggle simple/advanced view"
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.toggleSettingsMenu}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
