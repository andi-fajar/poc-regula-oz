import { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions, Checkbox } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { basePath } from '../config';
import ResultTabs from './result/ResultTab';
import {
    EventActions,
    defineComponents,
    InternalScenarios
  } from '@regulaforensics/vp-frontend-document-components';
  import {
    DocumentReaderApi,
    GraphicFieldType,
    Scenario,
    LCID,
    DocumentType
} from '@regulaforensics/document-reader-webclient';

const VerificationState = Object.freeze({
  NOT_STARTED: 0,
  DOCUMENT_VERIFICATION: 1,
  FACE_VERIFICATION: 2,
  DONE: 3
});

const RegulaDocsLiveness = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementDocsRef = useRef(null);
    const elementLivenessRef = useRef(null);
    const configuration = { basePath: basePath };
    const api = new DocumentReaderApi(configuration);
    const [readerResult, setReaderResult] = useState({});
    const [livenessResult, setLivenessResult] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [verificationState, setVerificationState] = useState(VerificationState.NOT_STARTED);

    const [checkRequest, setCheckRequest] = useState({});
    const [checkResponse, setCheckResponse] = useState({});
    const [checkIdCardOnly, setCheckIdCardOnly] = useState(true)


    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center'
      };

    const showResult = async () => {
        await requestOcr();
        setIsResultOpen(true)
    }

    const requestOcr = async () => {
        console.log(readerResult);
        const imageField = readerResult.images.getField(GraphicFieldType.DOCUMENT_FRONT);
        const documentFrontImage = imageField.valueList[0];
        const potrait = get(livenessResult, 'images.0', null)
        const processParam = {
            List: [
              {
                ImageData: {
                  image: documentFrontImage.value,
                  light: documentFrontImage.lightIndex
                }
              }
            ],
            processParam: {
                scenario: Scenario.OCR,
                documentIdList: checkIdCardOnly ? [
                    509424248,
                    1218661532,
                    1218661610,
                    1459656144,
                    -1664376400,
                    407567256,
                    427237424,
                    517293153,
                    517872759,
                    1030278437,
                    1218661366,
                    1218661451
                ] : [],
                lcidFilter: LCID.INDONESIAN,
                documentGroupFilter: checkIdCardOnly ? [DocumentType.IDENTITY_CARD] : [],
                checkAuth: true,
                authParams: {
                  checkLiveness: true
                },
                useFaceApi: true
            },
            livePortrait: potrait,
        }
        setLoading(true);
        const ocrResult = await api.process(processParam);
        setLoading(false)
        console.log("OCR RESULT:")
        console.log(ocrResult);
        setCheckResponse(ocrResult.rawResponse);
        setCheckRequest(processParam);
    }

    const regulaDocListener = useCallback(async (data) => {
        if (data.detail.action === EventActions.PROCESS_FINISHED) {
            const status = data.detail.data?.status;
            const isFinishStatus = status === 1;

            if (!isFinishStatus || !data.detail.data?.response) return;
            setReaderResult(data.detail.data.response)
            await new Promise(r => {
                setTimeout(r, 500);
                setVerificationState(VerificationState.FACE_VERIFICATION);
            });
        }

        if (data.detail?.action === EventActions.CLOSE) {
            navigate("/");
        }
    }, []);

    const regulaLivenessListener = useCallback(async (data) => {
      if (data.detail.action === 'PROCESS_FINISHED') {
        if (data.detail.data?.status === 1 && data.detail.data.response) {
            console.log("liveness result");
            console.log(data.detail.data.response);
            setLivenessResult(data.detail.data.response);
        }
    }

    if (data.detail?.action === 'CLOSE' || data.detail?.action === 'RETRY_COUNTER_EXCEEDED' || get(data, 'detail.data.response.code') === 0) {
        await new Promise(r => {
          setTimeout(r, 500);
          setVerificationState(VerificationState.DONE);
        });
    }
  }, []);

    useEffect(() => {
        console.log("INIT FIRST TIME")
        void defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAAs3hNcmFSdNSRH2RD7F6gWGLFuFXAcQmPTU3gqrJyouMIdR/jCvlxJoIjbzW1QFmVBiHV1FDoXGX/Oet6ki+OLkjsMMQoYqUsXUU1phEZtGPEYAd3sLAwd6vMU8fX8fBD/GRDHn006SS+JP79bHN7/EmHveEfX8hUVMtVv8sZroZeadke/L53XpRQtBRNWGMiRcpvoxMUK3QtFOysePSZtZUsBL9385dVu7KZHFpcYkqDza88BkZYXq1FjIaPWNVVMw0++DU24G0gR1FtYd11ggUND5uMmZ6c+xN2dpROoPqRNQEsTiG+hp87wLXikz3iJPdkaqT9CLmitbufQGSbDkAAAAAAAAEFhGRH6zzGtBsvTAfQdGpepR1NxoQcsNhhxUJ4L04BUD50J9TCxjczKpnHi5HdIqyiEUkxbeWeQ7aLeC8HES5Z2KKBYfe1OLKvPADO4zyvmsF1J2bcN2CNlj+KCVvhFiB0zVexTLOxWjfWg3NhzWug5wuMzY5g7umLrjmSPnguijeGer2zLScf+iXWnFy+Hygl7PPZ6SKQWhk//FbgulNgNH/d50BgfQE/hoz7y7EFT5xBCZgQrDQ0XnxH5eUxMfx4Uy6/r77gjjPC9RX52OFnl29Cps1Z2TYmyjBel5sH94' }));

        const containerCurrent = containerRef.current;
        if (!containerCurrent) return;

        containerCurrent.addEventListener('document-reader', regulaDocListener);
        containerCurrent.addEventListener('face-liveness', regulaLivenessListener);

        return () => {
            window.RegulaDocumentSDK.shutdown();
            containerCurrent.removeEventListener('document-reader', regulaDocListener);
            containerCurrent.removeEventListener('face-liveness', regulaLivenessListener);
        }
    }, [regulaDocListener, regulaLivenessListener]);

    useEffect(() => {
        let elementDocsRefCurrent = null;
        if (verificationState === VerificationState.DOCUMENT_VERIFICATION) {
          elementDocsRefCurrent = elementDocsRef.current;
        } else if (verificationState === VerificationState.FACE_VERIFICATION) {
          elementDocsRefCurrent = elementLivenessRef.current;
        }
        
        if (!elementDocsRefCurrent) return;

        let settings = (verificationState === VerificationState.DOCUMENT_VERIFICATION) ? (
          {
            serviceUrl: basePath,
            regulaLogo: false,
            internalScenario: InternalScenarios.Locate,
            captureButton: true,
            changeCameraButton: true,
            closeButton: false,
            captureMode: 'auto',
            cameraMode: 'environment'
          }
        ) : (
          {
            headers: {
                Test: 'Test',
            },
            customization: {
                onboardingScreenStartButtonBackground: '#2185d0',
                onboardingScreenStartButtonBackgroundHover: '#88d9ff',
                cameraScreenSectorActive: '#1969e9',
                cameraScreenSectorTarget: '#47d2ee',
                cameraScreenStrokeNormal: '#16b1ee',
                processingScreenProgress: '#046bb9',
                retryScreenRetryButtonBackground: '#2185d0',
                retryScreenRetryButtonBackgroundHover: '#88d9ff'
            },
            url: basePath,
            retryCount: 3
          }
        )
        
        elementDocsRefCurrent.settings = settings;
        console.log(`Verification state : ${verificationState}`)
        console.log(elementDocsRefCurrent.settings);
        console.log(elementDocsRefCurrent);
    }, [verificationState])

    const renderDocReader = () => <document-reader ref={elementDocsRef}></document-reader>;

    const renderLiveness = () => <face-liveness ref={elementLivenessRef}></face-liveness>;

    const renderMainPage = () =>
        <>
          <Segment inverted color="blue" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            borderRadius: 0
            }} textAlign="center" padded="very">
            <Header as="h1" content="Regula" />
            </Segment>
            <Grid divided='vertically' style={{
                            position: 'absolute',
                            top: '100px',
                            bottom: '100px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                            }}>
                {
                    ((verificationState === VerificationState.NOT_STARTED) && 
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                <Header as="h4">{`Please prepare your ${checkIdCardOnly ? 'e-KTP' : 'document'}`}</Header>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <Button onClick={() => setVerificationState(VerificationState.DOCUMENT_VERIFICATION)}>Click when ready</Button>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <></>
                            </GridColumn>
                            <GridColumn textAlign='center' centered style={{ maxWidth: '500px' }}>
                                <Checkbox toggle checked={checkIdCardOnly} onChange={(e, data) => setCheckIdCardOnly(data.checked)} 
                                        label='Check Indonesian ID Card only (e-KTP)'/>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                {!checkIdCardOnly ? <>Supported documents can be found <a href='https://docs.google.com/spreadsheets/d/1tEjV_S2GQWmt4SVjJfoKcbd85Ixont3dNMCsawo6MjU/edit?gid=888941511#gid=888941511'>here</a></> : ''}
                            </GridColumn>
                        </GridRow>
                    ) 
                  }
                  { 
                    ((verificationState === VerificationState.DONE) && 
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                <Header as="h3">Verification Completed!</Header>
                            </GridColumn>
                        </GridRow>
                    )
                }                
                
                <GridRow columns={2}>
                    <GridColumn textAlign='center'>
                        <Button onClick={() => navigate("/")}>Back</Button>
                    </GridColumn>
                    <GridColumn textAlign='center'>
                        <Button loading={isLoading} disabled={verificationState !== VerificationState.DONE || isLoading} onClick={() => showResult()}>Show result</Button>
                    </GridColumn>
                </GridRow>
            </Grid>
    
        
            <Modal
                closeIcon
                onClose={() => setIsResultOpen(false)}
                onOpen={() => setIsResultOpen(true)}
                open={isResultOpen}
                size='small'
            >
                <Header icon='archive' content='Result' />
                <ModalContent>
                    <Grid divided='vertically'>
                      <GridRow columns={1}>
                      <GridColumn>
                          <Header as='h3'>{`Liveness Result: ${get(livenessResult, 'status') === 0 ? "SUCCESS" :  (get(livenessResult, 'status') === 1 ? "REJECTED" : "UNKNOWN" )}`}</Header>
                          {get(livenessResult, 'status') === 1 && <>
                              <p>{`Rejection reason: ${get(livenessResult, 'code')}`} 
                                  <a href="https://docs.regulaforensics.com/develop/face-sdk/web-service/development/enums/face-sdk-result-code/" target="_blank" rel="noopener noreferrer"> (reference)</a>
                              </p>
                          </>} 
                          <Header as='h4'>{`Estimated age : ${get(livenessResult, 'estimatedAge', 'UNKNOWN')}`}</Header>
                      </GridColumn>
                      </GridRow>
                      <GridRow columns={1}>
                        <GridColumn>
                          <ResultTabs response={checkResponse} request={checkRequest} language="en" ></ResultTabs>
                        </GridColumn>
                      </GridRow>
                    </Grid>
                    
                </ModalContent>
                <ModalActions>
                <Button basic onClick={() => navigator.clipboard.writeText(JSON.stringify(checkResponse))}>
                    <Icon name='copy' /> Copy Raw Response
                </Button>
                <Button basic color='red' onClick={() => setIsResultOpen(false)}>
                    <Icon name='remove' /> Close
                </Button>
                </ModalActions>
            </Modal>
        
    
            <Segment style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            borderRadius: 0
            }} inverted textAlign="center" padded="very">
            <p>&copy; 2024 CSF</p>
            </Segment>
        </> ;
    

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div ref={containerRef} style={containerStyle}>
            {(verificationState === VerificationState.DOCUMENT_VERIFICATION) && renderDocReader()}
            {(verificationState === VerificationState.FACE_VERIFICATION) && renderLiveness()}
            {(verificationState === VerificationState.NOT_STARTED || verificationState === VerificationState.DONE) && renderMainPage()}
          </div>
          
      </div>
    )
}

export default RegulaDocsLiveness;