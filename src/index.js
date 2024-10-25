import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import Oz from './oz/Oz';
import RegulaDocsLiveness from './regula/RegulaDocsLiveness';
import RegulaDocsReader from './regula/RegulaDocsReader';
import reportWebVitals from './reportWebVitals';
import ResultTabs from './regula/result/ResultTab';
import HealthCheck from './HealthCheck';
import RegulaLiveness from './regula/RegulaLiveness'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { basePath } from './config';
import { DocumentReaderService } from '@regulaforensics/vp-frontend-document-components';
import '@regulaforensics/vp-frontend-face-components';
import 'semantic-ui-css/semantic.min.css';
import AaiLiveness from './aai/AaiLiveness';
import AaiDocs from './aai/AaiDocs';

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
        serviceURL: basePath
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
        <Route path="/regula-liveness" element={<RegulaLiveness />} />
        <Route path="/regula/result" element={<ResultTabs />} />
        <Route path="/oz-liveness" element={<Oz />} />
        <Route path="/healthcheck" element={<HealthCheck />} />
        <Route path='/aai-liveness' element={<AaiLiveness />} />
        <Route path='/aai-ocr' element={<AaiDocs />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
