import { useEffect, useState } from 'react';
import { Segment, Header, Grid, GridRow, GridColumn, Modal, Button, Icon, ModalContent, Image, ImageGroup, ModalActions, Tab, TabPane } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateEncryptedAaiSignature, generateToken, generateLivenessH5, getLivenessResult } from './AaiApis'
import useCookie from '../tools/useCookie';
import useQuery from '../tools/useQuery';
import { JsonViewer } from '@regulaforensics/ui-components';


const AaiLiveness = () => {
  const navigate = useNavigate();
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [livenessResult, setLivenessResult] = useState({});
  const [resultModalShown, setResultModalShown] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [signatureId, setSignatureId, deleteSignatureId] = useCookie('aaiSignatureId', null);
//   const [transactionId, setTransactionId, deleteTransactionId] = useCookie('aaiTransactionId', null);
  const { successCode, failCode, message } = useQuery();

  useEffect(() => {
    // uncomment later
    if (!successCode) {
        console.log("delete previous session")
        deleteSignatureId();
    }
  }, []);

  const handleOpenDemo = async () => {
    
    setLoadingGenerate(true)
    const tokenRawResponse = await generateToken();
    const h5LivenessResponse = await generateLivenessH5(tokenRawResponse.data.token)
    setSignatureId(h5LivenessResponse.data.signatureId)
    setLoadingGenerate(false)

    window.location.replace(h5LivenessResponse.data.url)
  }

  const getResult = async () => {
    if (!signatureId) return;

    setLoadingResult(true);
    const tokenRawResponse = await generateToken();
    const response = await getLivenessResult(tokenRawResponse.data.token, signatureId)
    setLoadingResult(false)
    console.log(response)
    setLivenessResult(response)
    setTimeout(() => setResultModalShown(true), 500);
  }



  const renderResultModal = () => {
    const panes = [
      { menuItem: 'Result', render: () => <TabPane>
         <Grid divided='vertically'>
            <GridRow columns={1}>
                <GridColumn>
                <Header as='h3'>{`Liveness Result: ${successCode}`}</Header>
                <Header as='h2'>{`Score : ${get(livenessResult, 'data.score')}`}</Header>
                </GridColumn>
            </GridRow>
            <GridRow columns={1}>
                <GridColumn>
                <Header as='h3'>Best Frame</Header>
                </GridColumn>
                <GridColumn>
                <Image src={"data:image/jpg;base64, " + get(livenessResult, 'data.image', '')} size='large' />
                </GridColumn>
            </GridRow>
            <GridRow columns={1}>
                <GridColumn>
                <Header as='h3'>Other Frame Captured:</Header>
                </GridColumn>
                <GridColumn>
                <ImageGroup size='small'>
                    { !isEmpty(get(livenessResult, 'data.imageFar', '')) && <Image src={"data:image/jpg;base64, " + get(livenessResult, 'data.imageFar', '')} />  }
                    { !isEmpty(get(livenessResult, 'data.imageNear', '')) && <Image src={"data:image/jpg;base64, " + get(livenessResult, 'data.imageNear', '')} />  }
                </ImageGroup>
                </GridColumn>
            </GridRow>
            </Grid>  

      </TabPane> },
      { menuItem: 'Raw Response', render: () => <TabPane>
        <JsonViewer data={livenessResult}></JsonViewer>
      </TabPane> }
    ]

    return <Modal
        closeIcon
        onClose={() => setResultModalShown(false)}
        onOpen={() => setResultModalShown(true)}
        open={resultModalShown}
        size='small'
    >
        <Header icon='archive' content='Result' />
        <ModalContent>
          <Tab panes={panes} />
        </ModalContent>
        <ModalActions>
        <Button basic onClick={() => navigator.clipboard.writeText(JSON.stringify(livenessResult))}>
            <Icon name='copy' /> Copy Raw Response
        </Button>
        <Button basic color='red' onClick={() => setResultModalShown(false)}>
            <Icon name='remove' /> Close
        </Button>
        </ModalActions>
    </Modal>
  }

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
                    
                      {!(isEmpty(successCode) && isEmpty(failCode)) ? 
                        <GridColumn textAlign='center' centered>
                          <Header as="h4">Liveness Check Complete</Header>
                          <Header as="h5">{`Result: ${successCode ? successCode : 'Fails'}`}</Header>
                          { failCode && <Header as="h6">{failCode}</Header> }
                          { message && <Header as="h6">{message}</Header> }
                        </GridColumn>
                       : 
                       <>
                        <GridColumn textAlign='center'>
                            <Button onClick={handleOpenDemo} loading={loadingGenerate} disabled={loadingGenerate}>Click Here When You Ready</Button>
                        </GridColumn>
                       </>
}  
                    
            </GridRow>
            <GridRow columns={2}>
                <GridColumn textAlign='center'>
                    <Button onClick={() => navigate("/")}>Back</Button>
                </GridColumn>
                <GridColumn textAlign='center'>
                    <Button loading={loadingResult} disabled={(isEmpty(successCode) && isEmpty(failCode)) || loadingResult} onClick={() => getResult()}>Show result</Button>
                </GridColumn>
        
            </GridRow>
        </Grid>
  
    
        {renderResultModal()}
    
  
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