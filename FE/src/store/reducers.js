import { combineReducers } from "@reduxjs/toolkit";
import { authReducer, logoutSuccess } from './Auth';

const mainReducer = combineReducers({
    auth: authReducer,
});

const rootReducer = (state, action) => {
    if(action.type === logoutSuccess.type) {
        state = {
            persistApp: state.persistApp, // Giữ lại phần persistApp nếu có
            publicCms: state.publicCms, // Giữ lại phần publicCms nếu có
        };    
    }
    return mainReducer(state, action);
};

export default rootReducer;