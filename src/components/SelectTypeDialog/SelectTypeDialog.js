import React, { PureComponent } from "react";
import {
  Dialog,
  Card,
  CardMedia,
  CardContent,
  withStyles,
  CardActions,
  Button
} from "@material-ui/core";
import "./SelectTypeDialog.css";

const styles = {
  root: {
    margin: 5
  }
};

class SelectTypeDialog extends PureComponent {

  render() {
    const { classes } = this.props;
    return (
      <Dialog
        BackdropProps={{ invisible: false }}
        open={this.props.show}
        className="select-type-dialog"
        disableRestoreFocus
      >
        <Card classes={{ root: classes.root }}>
          <CardMedia
            image="https://drm-wizard.com/wp-content/uploads/2015/04/easy-mode.png"
            style={{
              height: 150
            }}
          />
          <CardContent>
            <h1>Simple</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis,
              accusantium ducimus delectus dolore earum perspiciatis recusandae
              nobis numquam beatae amet!
            </p>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.props.selectType("simple")}
            >
              Select simple
            </Button>
          </CardActions>
        </Card>
        <Card classes={{ root: classes.root }}>
          <CardMedia
            image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/220px-Albert_Einstein_Head.jpg"
            style={{
              height: 150
            }}
          />
          <CardContent>
            <h1>Advanced</h1>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ipsa
              corrupti quas nemo soluta consequuntur accusantium dolores
              consectetur, voluptates voluptas harum.
            </p>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => this.props.selectType("advanced")}
              disabled
            >
              Select advanced
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    );
  }
}

export default withStyles(styles)(SelectTypeDialog);
