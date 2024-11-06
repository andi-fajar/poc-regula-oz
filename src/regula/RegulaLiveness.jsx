import { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, Header, Button, Grid, GridRow, GridColumn, Modal, Icon, ModalContent, ModalActions, Image } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import {
    defineComponents,
  } from '@regulaforensics/vp-frontend-document-components';
import { basePath } from '../config';

const RegulaWithLiveness = () => {
    const navigate = useNavigate();
    const [isResultOpen, setIsResultOpen] = useState(false);
    const containerRef = useRef(null);
    const elementRef = useRef(null);
    const [livenessResult, setLivenessResult] = useState({});
    const [livenessCheckStarted, setLivenessCheckStarted] = useState(false)

    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center'
      };

    const regulaListener = useCallback(async (data) => {
        if (data.detail.action === 'PROCESS_FINISHED') {
            if (data.detail.data?.status === 1 && data.detail.data.response) {
                console.log(data.detail.data.response);
                setLivenessResult(data.detail.data.response);
            }
        }

        if (data.detail?.action === 'CLOSE' || data.detail?.action === 'RETRY_COUNTER_EXCEEDED' || get(data, 'detail.data.response.code') === 0) {
            setLivenessCheckStarted(false);
        }
    }, []);

    useEffect(() => {
        console.log("INIT FIRST TIME")
        void defineComponents().then(() => window.RegulaDocumentSDK.initialize({ license: 'AAEAAAs3hNcmFSdNSRH2RD7F6gWGLFuFXAcQmPTU3gqrJyouMIdR/jCvlxJoIjbzW1QFmVBiHV1FDoXGX/Oet6ki+OLkjsMMQoYqUsXUU1phEZtGPEYAd3sLAwd6vMU8fX8fBD/GRDHn006SS+JP79bHN7/EmHveEfX8hUVMtVv8sZroZeadke/L53XpRQtBRNWGMiRcpvoxMUK3QtFOysePSZtZUsBL9385dVu7KZHFpcYkqDza88BkZYXq1FjIaPWNVVMw0++DU24G0gR1FtYd11ggUND5uMmZ6c+xN2dpROoPqRNQEsTiG+hp87wLXikz3iJPdkaqT9CLmitbufQGSbDkAAAAAAAAEFhGRH6zzGtBsvTAfQdGpepR1NxoQcsNhhxUJ4L04BUD50J9TCxjczKpnHi5HdIqyiEUkxbeWeQ7aLeC8HES5Z2KKBYfe1OLKvPADO4zyvmsF1J2bcN2CNlj+KCVvhFiB0zVexTLOxWjfWg3NhzWug5wuMzY5g7umLrjmSPnguijeGer2zLScf+iXWnFy+Hygl7PPZ6SKQWhk//FbgulNgNH/d50BgfQE/hoz7y7EFT5xBCZgQrDQ0XnxH5eUxMfx4Uy6/r77gjjPC9RX52OFnl29Cps1Z2TYmyjBel5sH94' }));

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
        
        if (!elementRefCurrent || !livenessCheckStarted) return;
        
        elementRefCurrent.settings = {
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
        console.log(elementRefCurrent.settings);
        console.log(elementRefCurrent);
    }, [livenessCheckStarted])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div ref={containerRef} style={containerStyle}>
            {
                livenessCheckStarted ? (
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
            <Header as="h1" content="Regula Liveness" />
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
                    isEmpty(livenessResult) ? (
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                <Header as="h4">Let's take selfie picture</Header>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <Button onClick={() => setLivenessCheckStarted(true)}>Click when you ready</Button>
                            </GridColumn>
                            <GridColumn textAlign='center' centered>
                                <></>
                            </GridColumn>
                        </GridRow>
                    ) : (
                        <GridRow columns={1} centered>
                            <GridColumn textAlign='center' centered>
                                <Header as="h3">Liveness check completed!</Header>
                            </GridColumn>
                        </GridRow>
                    )
                }                
                
                <GridRow columns={2}>
                    <GridColumn textAlign='center'>
                        <Button onClick={() => navigate("/")}>Back</Button>
                    </GridColumn>
                    <GridColumn textAlign='center'>
                        <Button disabled={isEmpty(livenessResult)} onClick={() => setIsResultOpen(true)}>Show result</Button>
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
                        <Header as='h3'>{`Liveness Result:`}</Header>
                        <Header as='h2'>{get(livenessResult, 'status') === 0 ? "SUCCESS" :  (get(livenessResult, 'status') === 1 ? "REJECTED" : "UNKNOWN" )}</Header>
                        {get(livenessResult, 'status') === 1 && <>
                            <p>{`Rejection reason: ${get(livenessResult, 'code')}`} 
                                <a href="https://docs.regulaforensics.com/develop/face-sdk/web-service/development/enums/face-sdk-result-code/" target="_blank" rel="noopener noreferrer"> (reference)</a>
                            </p>
                        </>} 
                    </GridColumn>
                    </GridRow>
                    <GridRow columns={1}>
                        <GridColumn>
                            <Header as='h4'>{`Estimated age : ${get(livenessResult, 'estimatedAge', 'UNKNOWN')}`}</Header>
                        </GridColumn>
                    </GridRow>
                    <GridRow columns={1}>
                    <GridColumn>
                        <Header as='h3'>Best Frame</Header>
                    </GridColumn>
                    <GridColumn>
                        <Image src={"data:image/jpg;base64, " + get(livenessResult, 'images.0', '')} size='large' />
                    </GridColumn>
                    </GridRow>
                    
                </Grid>  
                </ModalContent>
                <ModalActions>
                <Button basic onClick={() => navigator.clipboard.writeText(JSON.stringify(livenessResult))}>
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
