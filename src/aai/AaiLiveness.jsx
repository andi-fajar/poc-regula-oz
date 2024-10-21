import { useState } from 'react';
import { Segment, Header, Grid, GridRow, GridColumn, Modal, Button, Icon, ModalContent, Image, ImageGroup, ModalActions, Dropdown, Label } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { generateEncryptedAaiSignature, demoAaiLivenessSdkK3y } from '../config'


const AaiLiveness = () => {
  const navigate = useNavigate();
  const [captureResult, setCaptureResult] = useState({});
  const [livenessResult, setLivenessResult] = useState({});
  const [livenessStarted, setLivenessStarted] = useState(false);
  const [resultModalShown, setResultModalShown] = useState(false);
  const [actions, setActions] = useState([])

   const generateToken = async () => {
    const url = 'https://api.advance.ai/openapi/auth/ticket/v1/generate-token';
    const { signature, timestamp} = await generateEncryptedAaiSignature()
    const payload = {
        accessKey: demoAaiLivenessSdkK3y,
        signature,
        timestamp
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
   }

  const handleOpenDemo = async () => {
    
    await generateToken()
    
  }

  const handleChangeMode = (event, data) => {
    console.log(data.value);
    setActions(data.value);
  };

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
          <Header as="h1" content="AAI Liveness" />
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
                    
                      {livenessStarted ? 
                        <GridColumn textAlign='center' centered>
                          <Header as="h4">Liveness Check Complete</Header>
                        </GridColumn>
                       : 
                       <>
                        <GridColumn textAlign='center'>
                            <Button onClick={handleOpenDemo}>Click Here When You Ready</Button>
                        </GridColumn>
                       </>
}  
                    
            </GridRow>
            <GridRow columns={2}>
                
                  {livenessStarted ? 
                    <>
                      <GridColumn textAlign='center'>
                          <Button onClick={() => navigate("/")}>Back</Button>
                      </GridColumn>
                      <GridColumn textAlign='center'>
                          <Button loading={isEmpty(livenessResult) || isEmpty(captureResult)} disabled={isEmpty(livenessResult)} onClick={() => setResultModalShown(true)}>Show result</Button>
                      </GridColumn>
                    </>
                   : 
                    <div></div>
                  }
                
            </GridRow>
        </Grid>
  
    
        <Modal
            closeIcon
            onClose={() => setResultModalShown(false)}
            onOpen={() => setResultModalShown(true)}
            open={resultModalShown}
            size='small'
        >
            <Header icon='archive' content='Result' />
            <ModalContent>
              <Grid divided='vertically'>
                <GridRow columns={1}>
                  <GridColumn>
                    <Header as='h3'>{`Liveness Result:`}</Header>
                    <Header as='h2'>{get(livenessResult, 'folder_state')}</Header>
                  </GridColumn>
                </GridRow>
                <GridRow columns={1}>
                  <GridColumn>
                    <Header as='h3'>Best Frame</Header>
                  </GridColumn>
                  <GridColumn>
                    <Image src={get(captureResult, 'best_frame', '')} size='large' />
                  </GridColumn>
                </GridRow>
                <GridRow columns={1}>
                  <GridColumn>
                    <Header as='h3'>Other Frame Captured:</Header>
                  </GridColumn>
                  <GridColumn>
                    <ImageGroup size='small'>
                      { get(captureResult, 'frame_list', ['123']).map((element, index) => 
                        <Image key={`index${index}`} src={element} />  
                      ) }
                    </ImageGroup>
                  </GridColumn>
                </GridRow>
              </Grid>  
            </ModalContent>
            <ModalActions>
            <Button basic onClick={() => navigator.clipboard.writeText(JSON.stringify(captureResult))}>
                <Icon name='copy' /> Copy Raw Response
            </Button>
            <Button basic color='red' onClick={() => setResultModalShown(false)}>
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

export default AaiLiveness;