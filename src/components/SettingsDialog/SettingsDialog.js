import React, { PureComponent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Button,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch
} from "@material-ui/core";

import { Accessibility, SaveAlt } from "@material-ui/icons";

export default class SettingsDialog extends PureComponent {
  onChange = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {

    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.toggleSettingsMenu}
        disableRestoreFocus
        maxWidth={'md'}
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={16} direction='column'>
            <Grid item>
              <Paper elevation={2} style={{ marginTop: 5 }}>
                <List disablePadding>
                  <ListItem button onClick={this.props.toggleTypeDialog} divider disabled>
                    <ListItemText primary="Simple/advanced view"></ListItemText>
                    <ListItemIcon>
                      <Accessibility />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem button onClick={this.props.exportToCSV} divider>
                    <ListItemText primary="Export to CSV"></ListItemText>
                    <ListItemIcon>
                      <SaveAlt />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem button onClick={this.props.exportToIframe}>
                    <ListItemText primary="Export to IFrame"></ListItemText>
                    <ListItemIcon>
                      <SaveAlt />
                    </ListItemIcon>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item>
              <Card>
                <CardContent>
                  <FormControl>
                    <FormLabel component="legend">Start day</FormLabel>
                    <RadioGroup value={this.props.settings.firstDay} onChange={(_, value) => this.props.handleSettingChange('firstDay', value)}>
                      <FormControlLabel value={'1'} label="Monday" control={<Radio color="primary" />} />
                      <FormControlLabel value={'0'} label="Sunday" control={<Radio color="primary" />} />
                    </RadioGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel component="legend">Time format</FormLabel>
                    <RadioGroup value={this.props.settings.slotLabelFormat} onChange={(_, value) => this.props.handleSettingChange('slotLabelFormat', value)}>
                      <FormControlLabel value="ampm" label="AM PM" control={<Radio color="primary" />} />
                      <FormControlLabel value="24hour" label="24 hour" control={<Radio color="primary" />} />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Button color="primary" onClick={() => this.props.setView('01:00:00', '23:30:00')} variant="contained" style={{ marginRight: 5 }}>24 hour view</Button>
              <Button color="primary" onClick={() => this.props.setView('03:00:00', '21:00:00')} variant="contained">{this.props.settings.slotLabelFormat === 'ampm' ? '3AM - 9PM' : '03:00 - 21:00'}</Button>
            </Grid>
            <Grid item>
              <FormControlLabel control={<Switch color="primary" checked={this.props.settings.showThumbnail} onChange={(_, checked) => this.props.handleSettingChange('showThumbnail', checked)} />} label="Show thumbnails on calendar instances" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.toggleSettingsMenu}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
