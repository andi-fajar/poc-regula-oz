import React from 'react';
import {
  DocReaderContainer,
  Status,
  Info,
  Graphics,
  Rfid,
  ResponseViewer,
  RequestViewer,
  Logs,
  PortraitsComparison,
  StatusLoader,
  Tabs,
} from '@regulaforensics/ui-components';

const hasLogField = (response) => {
  return typeof response === 'object' && response !== null && 'log' in response;
};

const ResultsTab = () => (
  <>
    <Status/>
    <Info/>
    <Graphics/>
    <Rfid/>
    <PortraitsComparison/>
  </>
);

const getItems = (isLoading, response) => {
  if (isLoading) {
    return [{ id: 'Results', label: 'Results', children: <StatusLoader /> }];
  }

  const items = [
    { id: 'Results', label: 'Results', children: <ResultsTab /> },
    { id: 'Request', label: 'Request', children: <RequestViewer /> },
    { id: 'Response', label: 'Response', children: <ResponseViewer /> },
  ];

  if (hasLogField(response)) {
    items.push({ id: 'Logs', label: 'Logs', children: <Logs/> });
  }

  return items;
};

const ResultTabs = ({ response, request, language }) => {
  const isLoading = !response || !request;
  const items = getItems(isLoading, response);

  return (
    <DocReaderContainer
      response={response}
      request={request}
      language={language}
    >
      <Tabs
        type="line"
        items={items}
        initialTab={isLoading ? 'Results' : undefined}
      />
    </DocReaderContainer>
  );
};

export default ResultTabs;