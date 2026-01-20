import React from 'react';
import { IntegrationStatusProps } from './integrationStatusProps';
import IntegrationStatusView from './integrationStatusView';
import './integrationStatus.css';

const IntegrationStatus: React.FC<IntegrationStatusProps> = (props) => {
  return <IntegrationStatusView {...props} />;
};

export default IntegrationStatus;