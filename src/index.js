import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import Oz from './oz/Oz';
import RegulaDocsLiveness from './regula/RegulaDocsLiveness';
import RegulaDocsReader from './regula/RegulaDocsReader';
import reportWebVitals from './reportWebVitals';
import ResultTabs from './regula/result/ResultTab';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DocumentReaderService } from '@regulaforensics/vp-frontend-document-components';
import 'semantic-ui-css/semantic.min.css';

window.RegulaDocumentSDK = new DocumentReaderService();
window.RegulaDocumentSDK.recognizerProcessParam = {
  processParam: {
    scenario: 'Locate',
    returnUncroppedImage: true,
    multipageProcessing: false,
    returnPackageForReprocess: true,
    imageQa: {
      expectedPass: ['dpiThreshold', 'glaresCheck', 'focusCheck'],
      dpiThreshold: 130,
      glaresCheck: true,
      glaresCheckParams: {
        imgMarginPart: 0.05,
        maxGlaringPart: 0.01,
      },
      backendProcessing: {
        serviceURL: 'https://mfcrgla.mfc.staging-traveloka.com'
      }
    },
  }
};
window.RegulaDocumentSDK.imageProcessParam = {
  processParam: {
      scenario: 'Locate',
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/regula-doc" element={<RegulaDocsReader />} />
        <Route path="/regula-doc-liveness" element={<RegulaDocsLiveness />} />
        <Route path="/regula/result" element={<ResultTabs />} />
        <Route path="/oz-liveness" element={<Oz />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
