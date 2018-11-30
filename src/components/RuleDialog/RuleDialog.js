import React from 'react';
import { TimePicker } from "material-ui-pickers";
import { FormControlLabel, Button, Radio, RadioGroup, Dialog, Card, CardContent, CardActions, CardMedia } from '@material-ui/core';

function generateDays() {
    return ['Mo', 'Tu', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export default function RuleDialog(props) {

    const days = generateDays();
    return (
        <Dialog open={props.open}>
            <Card>
                <CardMedia component="img" height={200} src={'https://res.cloudinary.com/dcbbunxhy/image/upload/c_scale,q_auto,w_904/v1543573872/Kafnu-16.jpg'} style={{ objectFit: 'cover' }} />
                <CardContent className="flex column">
                    <p>Rule: Disable On Demand</p>
                    <RadioGroup value={props.rule.day} row name="day" onChange={(event, value) => props.handleRuleChange(event, 'day', value)}>
                        {days.map((day, index) => {
                            return <FormControlLabel label={day} value={index} control={<Radio color="primary" />} />
                        })}
                    </RadioGroup>
                    <TimePicker
                        label="Start time"
                        value={props.rule.start}
                        ampm={props.settings.slotLabelFormat === 'ampm'}
                        name="start"
                        onChange={(date) => props.handleRuleChange('start', date)} />
                    <TimePicker
                        label="End time"
                        style={{ marginTop: 10 }}
                        value={props.rule.end}
                        ampm={props.settings.slotLabelFormat === 'ampm'}
                        onChange={(date) => props.handleRuleChange('end', date)} />
                </CardContent>
                <CardActions>
                    <Button color="primary" onClick={props.addRule}>
                        Add rule
                    </Button>
                </CardActions>
            </Card>
        </Dialog>
    );
}