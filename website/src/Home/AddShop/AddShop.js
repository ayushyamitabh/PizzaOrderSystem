import React, {Component} from 'react';
import './AddShop.css';
import {Button,
        Card,
        CardContent,
        CardHeader,
        Divider, 
        FormControl,
        InputLabel,
        IconButton, 
        InputAdornment,
        LinearProgress, 
        MenuItem,
        Select, 
        Snackbar,
        TextField,
        Typography} from 'material-ui';
import Visible from 'material-ui-icons/Visibility';
import Hidden from 'material-ui-icons/VisibilityOff';
import Next from 'material-ui-icons/PlayCircleFilled';
import FileUpload from 'material-ui-icons/CloudUpload';
import Done from 'material-ui-icons/CheckCircle';
import * as firebase from 'firebase';

export default class AddShop extends Component{
    render() {
        return(
            <div  className="signup-page">
             <div className="AddShop-title-bar">
                 <Typography variant="display2">
                       Weirdoughs | Add Shop
                    </Typography>
                    <Typography variant="subheading" style={{marginTop:'10px'}}>
                        Add A Shop Below!
                    </Typography>
            </div>
          <Divider />
            <FormControl fullWidth style={{marginTop:'10px'}}> </FormControl>
                <div className="signup-page-content">
                    <Typography style={{marginTop:'10px'}} variant="subheading"> 
                        <Card style={{marginTop:'10px'}} data-aos="slide-up">
                            <CardContent>
                                 <TextField              
                                     id="addShop"
                                      label="Add Shop"
                                      required                           
                                      fullWidth
                                      className="push-down"/>
                                    <Button
                                    className="push-down" 
                                    fullWidth 
                                    variant="raised" 
                                    color="primary">
                                    Go!
                                </Button>
            
                            </CardContent>                                 
                        </Card>
                    </Typography>
                </div>         
            </div>
        );
    }
}