import { useState, useRef, useEffect } from 'react';
import { Segment, Container, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions } from 'semantic-ui-react';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import ResultTabs from './result/ResultTab';
import {
    EventActions,
    defineComponents,
    InternalScenarios
  } from '@regulaforensics/vp-frontend-document-components';
  import {
    DocumentReaderApi,
    GraphicFieldType,
    Scenario
} from '@regulaforensics/document-reader-webclient';


const RegulaDocsReader = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementRef = useRef(null);
    // const configuration = { basePath: 'https://nightly-api.regulaforensics.com' };
    const configuration = { basePath: 'https://mfcrgla.mfc.staging-traveloka.com' };
    const api = new DocumentReaderApi(configuration);
    const [readerResult, setReaderResult] = useState({});
    const [isLoading, setLoading] = useState(false);

    const [checkRequest, setCheckRequest] = useState({});
    const [checkResponse, setCheckResponse] = useState({});


    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '1024px'
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

    useEffect(() => {
        const containerCurrent = containerRef.current;
        const listener = (data) => {
            if (data.detail.action === EventActions.PROCESS_FINISHED) {
                const status = data.detail.data?.status;
                const isFinishStatus = status === 1;

                if (!isFinishStatus || !data.detail.data?.response) return;
                // console.log(data.detail.data.response);
                // TODO: try end to end server validation
                //window.RegulaDocumentSDK.finalizePackage().then((item) => { console.log(item) });
                // requestOcr(data.detail.data.response);
                setReaderResult(data.detail.data.response)
            }

            if (data.detail?.action === EventActions.CLOSE) {
                navigate("/");
            }
        };

        void defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAKuvmF430Aay0Ef9dG0Wmq73sE5BjW9l+N1vXOPPI5ZoQnFPMGE8Co3KojvtQib0M0PR5O+6l43x1wTBDifFY3yIKYUjRoomOdz4V2t4SEVehsia1xW0u8ZKc0N9IpSxPrREjCETQT9wnLrkZHwyZAIfLNRF+H+xUI0tkMImXwa6pvM/lzcvh+cfwGU/Tmg5cDakkqnHALlxYg1TfsmQkTOAZPI9hl7tEbxla2W8FucmwXEhKaPLRvcKrI/5Em8ZK+0iZ+bu1RRqAkUQfLhLym0si9HaLGRNAGsR6WD7ZfJkf5kL6polf/JaLaWESRY4QxvhHQUzHgq/+t5q9SDVuUnkAAAAAAAAEPJ86bDHkhTQkmx6xYF73dn+tfyT1maGHGl0dDMuBTI1ovI0dXCqoPAhR6BduAF7Ka2fM3YeqR2rE/8W2H5olwQ58t0ico9bYB6Td0oo+IDiG+l/Alacb1ppP4CbaQB1DeZAOphdTro63PjwdGYWXFEelAtZScNd+IOovGipufG36X+wIvnpx4MTvoBQySsmvU8kMHFeB+VP2a/1uKLVAYr5XC9OTTH2PZ4mevXBMr0kWoYtHae9tQOdchNuTEG5SmLQt2vNcCOt7uGzheIA6qHdGMCoT+pstf4FZGzfobMr' }));

        if (!containerCurrent) return;

        containerCurrent.addEventListener('document-reader', listener);

        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent) return;
        
        elementRefCurrent.settings = {
            serviceUrl: 'https://mfcrgla.mfc.staging-traveloka.com',
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
            containerCurrent.removeEventListener('document-reader', listener);
        }
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            <GridRow columns={1} centered>
                <GridColumn textAlign='center' centered>
                    <div ref={containerRef} style={containerStyle}>
                        <document-reader ref={elementRef}></document-reader>
                    </div>
                </GridColumn>
            </GridRow>
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
      </div>
    )
}

export default RegulaDocsReader;


