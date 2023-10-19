import LoginState from './states/login/state.js';
import MainState from './states/main/state.js';
import MainDashboardState from './states/main.dashboard/state.js';
import MainClientsState from './states/main.clients/state.js';
import MainUsersState from './states/main.users/state.js';
import MainLinkPreviewsState from './states/main.link-previews/state.js';
import MainLinkPreviewEditState from './states/main.link-preview-edit/state.js';
import MainLinkPreviewCreateState from './states/main.link-preview-create/state.js';
import MainScheduleState from './states/main.schedule/state.js';
import MainMasterScheduleState from './states/main.master-schedule/state.js';
import MainGroupScheduleState from './states/main.group-schedule/state.js';
import MainVersionsState from './states/main.versions/state.js';


export default [
    LoginState,
    MainState,
    MainDashboardState,
    MainClientsState,
    MainUsersState,
    MainMasterScheduleState,
    MainGroupScheduleState,
    MainScheduleState,
    MainLinkPreviewsState,
    MainLinkPreviewCreateState,
    MainLinkPreviewEditState,
    MainVersionsState
];