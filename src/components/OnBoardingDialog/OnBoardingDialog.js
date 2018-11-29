import React, { PureComponent } from 'react'
import { Dialog, Card, CardMedia, Stepper, Step, StepLabel, CardContent, IconButton, Button } from '@material-ui/core';
import { Close } from "@material-ui/icons";

function getSteps() {
    return ['Welcome', 'More simple', 'Better experience', 'Optional new features'];
}

function getStepContent(step) {
    switch (step) {
        case 0:
            return (<div><h1>Welcome to the new calendar</h1><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus at consequatur eius molestias, illo reprehenderit est nihil soluta iusto illum!</p></div>);
        case 1:
            return <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quaerat, nostrum?</p>
        case 2:
            return <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit totam rerum, officia placeat sequi ex laboriosam hic corporis sint in!</p>
        case 3:
            return <p>Lorem ipsum dolor sit amet.</p>
    }
}

function getImg(step) {
    switch (step) {
        case 0:
            return 'https://www.welltodoglobal.com/wp-content/uploads/2016/08/13528519_1403797416302206_8257769746736443972_o.jpg';
        case 1:
            return 'https://res.cloudinary.com/dcbbunxhy/image/upload/q_auto/v1543495634/add-event.gif';
        case 2:
            return 'https://res.cloudinary.com/dcbbunxhy/image/upload/q_auto/v1543495635/change-calendar.gif';
        case 3:
            return 'https://res.cloudinary.com/dcbbunxhy/image/upload/q_auto/v1543495635/features.gif';
    }
}

export default class OnBoardingDialog extends PureComponent {
    state = {
        activeStep: 0
    }

    goToStep = (index) => {
        this.setState({ activeStep: index });
    }

    render() {

        const steps = getSteps();

        const stepContent = getStepContent(this.state.activeStep);

        const img = getImg(this.state.activeStep);

        return (
            <Dialog open={this.props.open}>
                <Card>
                    <div>
                        <CardMedia component="img" src={img} height={200} style={{ objectFit: 'cover', objectPosition: 'top' }}>
                        </CardMedia>
                        <IconButton className="dialog-close-btn" onClick={this.props.toggle}>
                            <Close />
                        </IconButton>
                    </div>
                    <CardContent style={{ textAlign: 'center', height: '100px' }}>
                        {stepContent}
                    </CardContent>
                    <div style={{ textAlign: 'center' }}>
                        {this.state.activeStep < 3 ?
                            <Button onClick={() => this.goToStep(this.state.activeStep + 1)}>Next</Button>
                            : <Button onClick={this.props.toggle}>Close</Button>}
                    </div>
                    <Stepper activeStep={this.state.activeStep} alternativeLabel>
                        {steps.map((s, index) => <Step key={s} onClick={() => this.goToStep(index)}>
                            <StepLabel>{s}</StepLabel>
                        </Step>
                        )}
                    </Stepper>
                </Card>
            </Dialog>
        )
    }
}
