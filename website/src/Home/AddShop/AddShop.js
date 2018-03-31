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
    constructor(props) {
        super(props);
        this.state = {
            
        }
    };
    
    
    render() {
        return(  
             
           
            <div className="addShop-page">   
                <div className="addShop-title-bar">
                    <Typography variant="display2">
                       Weirdoughs | Add-Shop
                    </Typography>
                    <Typography variant="subheading" style={{marginTop:'10px'}}>
                        Add a new shop below!
                    </Typography>
                </div>       
                <Divider />
            
           
             <Typography style={{marginTop:'10px'}} variant="subheading"> 
                <Card style={{marginTop:'10px'}} data-aos="slide-up">
                 <CardContent>
            <TextField                             
                label="Shop"
                type="Shop"
                id="Shop"
                required
                fullWidth
                className="push-down"
                                />
            <Button fullWidth 
                variant="raised" 
                color="primary" 
                className="push-down">
                Go
            </Button>
            
            </CardContent>
            </Card>
            </Typography>
          
      
            </div>
            
        );
    }
}