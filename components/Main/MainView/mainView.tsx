
import React from 'react';
import { MainViewProps } from './mainViewProps';
import MainViewView from './mainViewView';
import './mainView.css';

const MainView: React.FC<MainViewProps> = (props) => {
  return <MainViewView {...props} />;
};

export default MainView;
