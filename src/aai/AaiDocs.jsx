import { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions, Checkbox, Loader, Tab, TabPane, Container, Label, Image } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import {
    EventActions,
    defineComponents
  } from '@regulaforensics/vp-frontend-document-components';
import {
    detectIdForgery, ocrKtpCheck, generateToken
} from './AaiApis';
import { JsonViewer } from '@regulaforensics/ui-components';

const InfoField = ({ label, value }) => (
    <Container className="mb-4">
      <Label color="blue" ribbon>
        {label}
      </Label>
      <Container className="mt-2 text-lg">
        {value || '-'}
      </Container>
    </Container>
  );


const AaiDocs = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementRef = useRef(null);
    const [readerResult, setReaderResult] = useState({});
    const [isOcrLoading, setOcrLoading] = useState(false);
    const [isIdForgeryLoading, setIdForgeryLoading] = useState(false);
    const [documentCheckStarted, setDocumentCheckStarted] = useState(false);

    const [ocrResponse, setOcrResponse] = useState({});
    const [idForgeryResponse, setIdForgeryResponse] = useState({});
    const [checkIdForgery, setCheckIdForgery] = useState(true)


    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center'
      };

    const showResult = async () => {
        setIsResultOpen(true)
    }

    const requestOcr = async (imageBase64) => {
        setOcrLoading(true)
        const tokenRawResponse = await generateToken();
        const imageData = `data:image/jpeg;base64,${imageBase64}`;
        const ocrKtpCheckResult = await ocrKtpCheck(tokenRawResponse.data.token, imageData, true)
        console.log(ocrKtpCheckResult)
        setOcrResponse(ocrKtpCheckResult)

        setOcrLoading(false)
    }

    const requestIdForgery = async (imageBase64) => {
        if (!checkIdForgery) {
            setIdForgeryResponse({})
            console.log("Skip ID Card forgery checking")
            return;
        }
        setIdForgeryLoading(true)
        const tokenRawResponse = await generateToken();
        const imageData = `data:image/jpeg;base64,${imageBase64}`;
        const detectIdForgeryResponse = await detectIdForgery(tokenRawResponse.data.token, imageData, true)
        console.log(detectIdForgeryResponse)
        setIdForgeryResponse(detectIdForgeryResponse)

        setIdForgeryLoading(false)
    }

    const regulaListener = useCallback(async (data) => {
        if (data.detail.action === EventActions.PROCESS_FINISHED) {
            const status = data.detail.data?.status;
            const isFinishStatus = status === 1;

            if (!isFinishStatus || !data.detail.data?.response) return;
            console.log(data.detail.data?.response)
            const imageBase64 = data.detail.data?.response[0].raw
            setReaderResult(data.detail.data.response)
            await new Promise(r => {
                requestOcr(imageBase64);
                requestIdForgery(imageBase64);
                setTimeout(r, 500);
                setDocumentCheckStarted(false);
            });
        }

        if (data.detail?.action === EventActions.CLOSE) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        console.log("INIT FIRST TIME")

        defineComponents();
        const containerCurrent = containerRef.current;
        if (!containerCurrent) return;

        containerCurrent.addEventListener('camera-snapshot', regulaListener);

        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent) return;
        
        return () => {
            window.RegulaDocumentSDK.shutdown();
            containerCurrent.removeEventListener('camera-snapshot', regulaListener);
        }
    }, [regulaListener]);

    useEffect(() => {
        const elementRefCurrent = elementRef.current;
        
        if (!elementRefCurrent) return;
        elementRefCurrent.settings = {
            startScreen: false,
            changeCameraButton: true,
            regulaLogo: false,
            cameraMode: 'environment'
        };
        console.log(elementRefCurrent.settings);
        console.log(elementRefCurrent);
    }, [documentCheckStarted])

  const renderModal = () => {

    const panes = [
      { menuItem: 'Result', render: () => <TabPane>
        <Grid divided='vertically'>
            <GridRow columns={1}>
              <GridColumn>
                <Header as='h4'>KTP Image</Header>
                <Image src={`data:image/jpg;base64,${get(readerResult, '0.raw', '')}`} size='medium' />
              </GridColumn>
            </GridRow>
            {
                !isEmpty(idForgeryResponse) && <GridRow columns={2}>
                <Grid.Column>
                    <Header as="h4">ID Forgery Check</Header>
                </Grid.Column>
                <Grid.Column>
                    <Icon name={get(idForgeryResponse, 'data.result') === 'fail' ? 'dont' : 'check circle'} size='large' color={get(idForgeryResponse, 'data.result') === 'fail' ? 'red' : 'green'}>{get(idForgeryResponse, 'data.result').toUpperCase()}</Icon>
                </Grid.Column>
                <GridColumn>
                    <InfoField label="ID Forgery Check Result" value={get(idForgeryResponse, 'data.result').toUpperCase()} />
                </GridColumn>
                <GridColumn>
                    <InfoField label="Reason" value={get(idForgeryResponse, 'data.detail')} />
                </GridColumn>
              </GridRow>
            }
        
        <Grid.Row columns={2}>
          <Grid.Column width={16}>
            <Header as="h5">Personal Information</Header>
          </Grid.Column>
          <Grid.Column>
            <InfoField label="ID Number" value={get(ocrResponse, 'data.idNumber')} />
            <InfoField label="Name" value={get(ocrResponse, 'data.name')} />
            <InfoField label="Gender" value={get(ocrResponse, 'data.gender')} />
            <InfoField label="Blood Type" value={get(ocrResponse, 'data.bloodType')} />
            <InfoField label="Religion" value={get(ocrResponse, 'data.religion')} />
            <InfoField label="Nationality" value={get(ocrResponse, 'data.nationality')} />
          </Grid.Column>
          
          <Grid.Column>
            <InfoField label="Place of Birth" value={get(ocrResponse, 'data.placeOfBirth')} />
            <InfoField label="Birthday" value={get(ocrResponse, 'data.birthday')} />
            <InfoField label="Marital Status" value={get(ocrResponse, 'data.maritalStatus')} />
            <InfoField label="Occupation" value={get(ocrResponse, 'data.occupation')} />
            <InfoField label="Expiry Date" value={get(ocrResponse, 'data.expiryDate')} />
          </Grid.Column>
        </Grid.Row>

        {/* Address Section */}


        <Grid.Row columns={2}>
            <Grid.Column width={16}>
            <Header as="h5">Address Information</Header>
          </Grid.Column>
          <Grid.Column>
            <InfoField label="Address" value={get(ocrResponse, 'data.address')} />
            <InfoField label="RT/RW" value={get(ocrResponse, 'data.rtrw')} />
            <InfoField label="Village" value={get(ocrResponse, 'data.village')} />
          </Grid.Column>
          
          <Grid.Column>
            <InfoField label="District" value={get(ocrResponse, 'data.district')} />
            <InfoField label="City" value={get(ocrResponse, 'data.city')} />
            <InfoField label="Province" value={get(ocrResponse, 'data.province')} />
          </Grid.Column>
        </Grid.Row>

          </Grid>  

      </TabPane> },
      { menuItem: 'Raw Response OCR', render: () => <TabPane>
        <JsonViewer data={ocrResponse}></JsonViewer>
      </TabPane> }
    ]

    if (checkIdForgery) {
        panes.push(
            { menuItem: 'Raw Response ID Forgery', render: () => <TabPane>
                <JsonViewer data={idForgeryResponse}></JsonViewer>
              </TabPane> }
        )
    }

    return <Modal
        closeIcon
        onClose={() => setIsResultOpen(false)}
        onOpen={() => setIsResultOpen(true)}
        open={isResultOpen}
        size='small'
    >
        <Header icon='archive' content='Result' />
        <ModalContent>
          <Tab panes={panes} />
        </ModalContent>
        <ModalActions>
        <Button basic color='red' onClick={() => setIsResultOpen(false)}>
            <Icon name='remove' /> Close
        </Button>
        </ModalActions>
    </Modal>
  }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div ref={containerRef} style={containerStyle}>
            {
                documentCheckStarted ? (
                        <camera-snapshot ref={elementRef}></camera-snapshot>
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
                                <Header as="h4">{`Please prepare your e-KTP`}</Header>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <Button onClick={() => setDocumentCheckStarted(true)}>Click when ready</Button>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <></>
                            </GridColumn>
                            <GridColumn textAlign='center' centered style={{ maxWidth: '500px' }}>
                                <Checkbox toggle checked={checkIdForgery} onChange={(e, data) => setCheckIdForgery(data.checked)} 
                                        label='Check ID Card Forgery'/>
                            </GridColumn>
                        </GridRow>
                    ) : (
                        <>
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                { 
                                    (isIdForgeryLoading || isOcrLoading) && 
                                        <Loader active={(isIdForgeryLoading || isOcrLoading)} loading={(isIdForgeryLoading || isOcrLoading)} indeterminate>
                                            {
                                                isIdForgeryLoading && 'Checking ID Forgery. '
                                            }
                                            {
                                                isOcrLoading && 'Checking OCR. '
                                            }
                                        </Loader>
                                }
                                {!isIdForgeryLoading && !isOcrLoading && <Header as="h3">ID Card Check Completed!</Header>}
                            </GridColumn>
                            
                        </GridRow>
                        </>
                    )
                }                
                
                <GridRow columns={2}>
                    <GridColumn textAlign='center'>
                        <Button onClick={() => navigate("/")}>Back</Button>
                    </GridColumn>
                    <GridColumn textAlign='center'>
                        <Button loading={isOcrLoading} disabled={isEmpty(ocrResponse) || isIdForgeryLoading || isOcrLoading} onClick={() => showResult()}>Show result</Button>
                    </GridColumn>
                </GridRow>
            </Grid>
    
            { renderModal() }
    
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

export default AaiDocs;


