import { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions, Checkbox } from 'semantic-ui-react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import ResultTabs from './result/ResultTab';
import {
    // EventActions,
    defineComponents,
    // InternalScenarios
  } from '@regulaforensics/vp-frontend-document-components';
  import {
    DocumentReaderApi,
    GraphicFieldType,
    Scenario,
    LCID,
    DocumentType
} from '@regulaforensics/document-reader-webclient';
// import { FaceLivenessDetailType, FaceLivenessWebComponent } from '@regulaforensics/vp-frontend-face-components';


const RegulaWithLiveness = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementRef = useRef(null);
    const configuration = { basePath: 'https://nightly-api.regulaforensics.com' };
    // const configuration = { basePath: 'https://mfcrgla.mfc.staging-traveloka.com' };
    const api = new DocumentReaderApi(configuration);
    const [readerResult, setReaderResult] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [documentCheckStarted, setDocumentCheckStarted] = useState(false)

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
        const documentFront = imageField.valueList[0].value;
        const processParam = {
            images: [ documentFront ],
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
                checkAuth: true
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
        if (data.detail.action === 'PROCESS_FINISHED') {
            if (data.detail.data?.status === 1 && data.detail.data.response) {
                console.log(data.detail.data.response);
            }
        }

        if (data.detail?.action === 'CLOSE' || data.detail?.action === 'RETRY_COUNTER_EXCEEDED') {
            setDocumentCheckStarted(false);
        }
    }, []);

    useEffect(() => {
        console.log("INIT FIRST TIME")
        void defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAKuvmF430Aay0Ef9dG0Wmq73sE5BjW9l+N1vXOPPI5ZoQnFPMGE8Co3KojvtQib0M0PR5O+6l43x1wTBDifFY3yIKYUjRoomOdz4V2t4SEVehsia1xW0u8ZKc0N9IpSxPrREjCETQT9wnLrkZHwyZAIfLNRF+H+xUI0tkMImXwa6pvM/lzcvh+cfwGU/Tmg5cDakkqnHALlxYg1TfsmQkTOAZPI9hl7tEbxla2W8FucmwXEhKaPLRvcKrI/5Em8ZK+0iZ+bu1RRqAkUQfLhLym0si9HaLGRNAGsR6WD7ZfJkf5kL6polf/JaLaWESRY4QxvhHQUzHgq/+t5q9SDVuUnkAAAAAAAAEPJ86bDHkhTQkmx6xYF73dn+tfyT1maGHGl0dDMuBTI1ovI0dXCqoPAhR6BduAF7Ka2fM3YeqR2rE/8W2H5olwQ58t0ico9bYB6Td0oo+IDiG+l/Alacb1ppP4CbaQB1DeZAOphdTro63PjwdGYWXFEelAtZScNd+IOovGipufG36X+wIvnpx4MTvoBQySsmvU8kMHFeB+VP2a/1uKLVAYr5XC9OTTH2PZ4mevXBMr0kWoYtHae9tQOdchNuTEG5SmLQt2vNcCOt7uGzheIA6qHdGMCoT+pstf4FZGzfobMr' }));

        const containerCurrent = containerRef.current;
        if (!containerCurrent) return;

        containerCurrent.addEventListener('face-liveness', regulaListener);
        return () => {
            window.RegulaDocumentSDK.shutdown();
            containerCurrent.removeEventListener('face-liveness', regulaListener);
        }
    }, [regulaListener]);

    useEffect(() => {
        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent || !documentCheckStarted) return;
        
        elementRefCurrent.settings = {
                headers: {
                    Test: 'Test',
                },
                tag: '123',
                customization: {
                    onboardingScreenStartButtonBackground: '#5b5050',
                },
                // workerPath: 'https://nightly-api.regulaforensics.com',
                // url: 'https://nightly-api.regulaforensics.com',
            }
        console.log(elementRefCurrent.settings);
        console.log(elementRefCurrent);
    }, [documentCheckStarted])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div ref={containerRef} style={containerStyle}>
            {
                documentCheckStarted ? (
                    <face-liveness ref={elementRef}></face-liveness>
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

export default RegulaWithLiveness;
