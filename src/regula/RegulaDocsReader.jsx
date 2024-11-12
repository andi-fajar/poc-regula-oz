import { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions, Checkbox } from 'semantic-ui-react';
import { isEmpty } from 'lodash';
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

import { ReactComponent as FrameSVG } from './ktp_frame.svg';

const documentReaderStyle = {
    'position': 'absolute',
    'top': '0',
    'left': '0',
    '--main-color': 'blue',
    backgroundColor: 'black'
}

const disclaimerText = {
    display: 'block',
    position: 'absolute',
    zIndex: 1,
    textAlign: 'center',
    fontFamily: 'Noto Sans, sans-serif',
    lineHeight: '150%',
    padding: '0.75em 1.5em',
    marginTop: '20px',
    color: 'black',
    right: '50%',
    top: '70%',
    transform: 'translate(62%, 0)',
    backgroundColor: 'white',
    borderRadius: '6px',
};

const frameKtpStyle = {
    display: 'block',
    position: 'absolute',
    zIndex: 1,
    textAlign: 'center'
}

const containerStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    position: 'relative',
    width: '100%',
    height: '100vh',
  };

const RegulaDocsReader = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementRef = useRef(null);
    // const configuration = { basePath: 'https://nightly-api.regulaforensics.com' };
    const configuration = { basePath: basePath };
    const api = new DocumentReaderApi(configuration);
    const [readerResult, setReaderResult] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [documentCheckStarted, setDocumentCheckStarted] = useState(false)

    const [checkRequest, setCheckRequest] = useState({});
    const [checkResponse, setCheckResponse] = useState({});
    const [checkIdCardOnly, setCheckIdCardOnly] = useState(true)

    const showResult = async () => {
        await requestOcr();
        setIsResultOpen(true)
    }

    const requestOcr = async () => {
        console.log(readerResult);
        const imageField = readerResult.images.getField(GraphicFieldType.DOCUMENT_FRONT);
        const documentFront = imageField.valueList[0].value;
        const processParam = {
            images: [ documentFront ],
            processParam: {
                scenario: Scenario.FULL_PROCESS,
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
                documentGroupFilter: checkIdCardOnly ? [DocumentType.IDENTITY_CARD] : []
            }
        }
        setLoading(true);
        const ocrResult = await api.process(processParam);
        setLoading(false)
        console.log("OCR RESULT:")
        console.log(ocrResult);
        setCheckResponse(ocrResult.rawResponse);
        setCheckRequest(processParam);
    }

    const regulaListener = useCallback(async (data) => {
        if (data.detail.action === EventActions.PROCESS_FINISHED) {
            const status = data.detail.data?.status;
            const isFinishStatus = status === 1;

            if (!isFinishStatus || !data.detail.data?.response) return;
            // console.log(data.detail.data.response);
            // TODO: try end to end server validation
            //window.RegulaDocumentSDK.finalizePackage().then((item) => { console.log(item) });
            // requestOcr(data.detail.data.response);
            setReaderResult(data.detail.data.response)
            await new Promise(r => {
                setTimeout(r, 700);
                setDocumentCheckStarted(false);
            });
        }

        if (data.detail?.action === EventActions.CLOSE) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        console.log("INIT FIRST TIME")
        void defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAAs3hNcmFSdNSRH2RD7F6gWGLFuFXAcQmPTU3gqrJyouMIdR/jCvlxJoIjbzW1QFmVBiHV1FDoXGX/Oet6ki+OLkjsMMQoYqUsXUU1phEZtGPEYAd3sLAwd6vMU8fX8fBD/GRDHn006SS+JP79bHN7/EmHveEfX8hUVMtVv8sZroZeadke/L53XpRQtBRNWGMiRcpvoxMUK3QtFOysePSZtZUsBL9385dVu7KZHFpcYkqDza88BkZYXq1FjIaPWNVVMw0++DU24G0gR1FtYd11ggUND5uMmZ6c+xN2dpROoPqRNQEsTiG+hp87wLXikz3iJPdkaqT9CLmitbufQGSbDkAAAAAAAAEFhGRH6zzGtBsvTAfQdGpepR1NxoQcsNhhxUJ4L04BUD50J9TCxjczKpnHi5HdIqyiEUkxbeWeQ7aLeC8HES5Z2KKBYfe1OLKvPADO4zyvmsF1J2bcN2CNlj+KCVvhFiB0zVexTLOxWjfWg3NhzWug5wuMzY5g7umLrjmSPnguijeGer2zLScf+iXWnFy+Hygl7PPZ6SKQWhk//FbgulNgNH/d50BgfQE/hoz7y7EFT5xBCZgQrDQ0XnxH5eUxMfx4Uy6/r77gjjPC9RX52OFnl29Cps1Z2TYmyjBel5sH94' }));

        const containerCurrent = containerRef.current;
        if (!containerCurrent) return;

        containerCurrent.addEventListener('document-reader', regulaListener);

        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent) return;
        
        elementRefCurrent.settings = {
            serviceUrl: basePath,
            regulaLogo: false,
            internalScenario: InternalScenarios.Locate,
            captureButton: true,
            changeCameraButton: true,
            closeButton: false,
            captureMode: 'auto',
            cameraMode: 'environment'
        };
        console.log(elementRefCurrent.settings);
        console.log(elementRefCurrent);
        return () => {
            window.RegulaDocumentSDK.shutdown();
            containerCurrent.removeEventListener('document-reader', regulaListener);
        }
    }, [regulaListener]);

    useEffect(() => {
        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent) return;
        
        elementRefCurrent.settings = {
            serviceUrl: basePath,
            regulaLogo: false,
            internalScenario: InternalScenarios.Locate,
            captureButton: false,
            changeCameraButton: true,
            closeButton: false,
            captureMode: 'auto',
            cameraMode: 'environment',
            backgroundMaskAlpha: 1,
            cameraFrameOffsetWidth: 5,
            changeCameraButton: false,
            cameraFrameBorderWidth: '1',
            statusPositionMultiplier: 2
        };
        console.log(elementRefCurrent.settings);
        console.log(elementRefCurrent);
    }, [documentCheckStarted])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div ref={containerRef} style={containerStyle}>
            {
                documentCheckStarted ? (
                        <>
                            <FrameSVG style={frameKtpStyle}></FrameSVG>
                            <div style={disclaimerText}>Akan dipake traveloka</div>
                            <document-reader ref={elementRef} style={documentReaderStyle}></document-reader>
                        </>
                        
                ) : (
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
            <Header as="h1" content="Regula Doc" />
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
                    isEmpty(readerResult) ? (
                        <GridRow columns={1} centered>
                            <GridColumn>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <Header as="h4">{`Please prepare your ${checkIdCardOnly ? 'e-KTP' : 'document'}`}</Header>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <Button onClick={() => setDocumentCheckStarted(true)}>Click when ready</Button>
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
                    ) : (
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                <Header as="h3">ID Card Check Completed!</Header>
                            </GridColumn>
                        </GridRow>
                    )
                }                
                
                <GridRow columns={2}>
                    <GridColumn textAlign='center'>
                        <Button onClick={() => navigate("/")}>Back</Button>
                    </GridColumn>
                    <GridColumn textAlign='center'>
                        <Button loading={isLoading} disabled={isEmpty(readerResult) || isLoading} onClick={() => showResult()}>Show result</Button>
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
                    <ResultTabs response={checkResponse} request={checkRequest} language="en" ></ResultTabs>
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
        </>  
                )
            }
        </div>
          
      </div>
    )
}

export default RegulaDocsReader;


