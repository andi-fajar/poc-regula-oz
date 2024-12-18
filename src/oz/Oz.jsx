import { useState } from 'react';
import { Segment, Header, Grid, GridRow, GridColumn, Modal, Button, Icon, ModalContent, Image, ImageGroup, ModalActions, Dropdown, Label, Tab, TabPane } from 'semantic-ui-react';
import { isEmpty, get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { JsonViewer } from '@regulaforensics/ui-components'
import { getLivenessResult } from './OzApi'

const containerStyle = {
  justifyContent: 'center',
  alignItems: 'center'
};

const Oz = () => {
  const navigate = useNavigate();
  const [captureResult, setCaptureResult] = useState({});
  const [livenessResult, setLivenessResult] = useState({});
  const [livenessStarted, setLivenessStarted] = useState(false);
  const [resultModalShown, setResultModalShown] = useState(false);
  const [resultBe, setResultBe] = useState({});
  const [transactionId, setTransactionId] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const availableActions = ['video_selfie_left', 'video_selfie_right', 'video_selfie_down', 'video_selfie_high', 'video_selfie_smile', 'video_selfie_eyes', 'video_selfie_scan', 'video_selfie_best', 'video_selfie_blank']
  const [actions, setActions] = useState([])

  const handleOpenDemo = () => {
    const random = Math.floor(Math.random() * 100)
    const now = Date.now();
    const randomId = `${now}_${random}`;
    setTransactionId(randomId);
    setLivenessStarted(true)
   
    window.OzLiveness.open({
        meta: { 
          'transaction_id': randomId
        },
        action: (isEmpty(actions) ? null : actions),
        on_error: result => console.error('on_error', result),
        on_submit: result => console.log('on_submit', result),
        on_result: result => console.log('on_result', result),
        on_complete: result => {
          console.log('on_complete', result);
          setLivenessResult(result);
        },
        on_close: result => console.log('on_close', result),
        on_capture_complete: result => {
          console.log('on_capture_complete', result);
          setCaptureResult(result)
        },
    });
  }

  const getResultFromBe = async () => {
    setLoadingResult(true);
    const response = await getLivenessResult(transactionId);
    setResultBe(response)
    setLoadingResult(false);
    setResultModalShown(true);
  }

  const renderResultModal = () => {

    const panes = [
      { menuItem: 'Result', render: () => <TabPane>
        <Grid divided='vertically'>
            <GridRow columns={1}>
              <GridColumn>
                <Header as='h3'>{`Liveness Result:`}</Header>
                <Header as='h2'>{get(livenessResult, 'folder_state')}</Header>
              </GridColumn>
            </GridRow>
            <GridRow columns={2}>
              <GridColumn>
                <Header as='h3'>Best Frame (FE)</Header>
              </GridColumn>
              <GridColumn>
                <Header as='h3'>Best Frame from BE</Header>
              </GridColumn>
              <GridColumn>
                <Image src={get(captureResult, 'best_frame', '')} size='large' />
              </GridColumn>
              <GridColumn>
                <Image src={get(resultBe, 'items.0.analyses.0.results_media.0.output_images.0.original_url', '')} size='large' />
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

      </TabPane> },
      { menuItem: 'Raw Response (FE)', render: () => <TabPane>
        <JsonViewer data={{...captureResult, ...livenessResult}}></JsonViewer>
      </TabPane> },
       { menuItem: 'Raw Response (BE)', render: () => <TabPane>
        <JsonViewer data={resultBe}></JsonViewer>
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
        <Button basic onClick={() => navigator.clipboard.writeText(JSON.stringify(captureResult))}>
            <Icon name='copy' /> Copy Raw Response
        </Button>
        <Button basic color='red' onClick={() => setResultModalShown(false)}>
            <Icon name='remove' /> Close
        </Button>
        </ModalActions>
    </Modal>
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
          <Header as="h1" content="Oz Liveness" />
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
                        <GridColumn style={{ maxWidth: '500px' }}>
                          <Label>Select liveness check actions: </Label>
                          <Dropdown placeholder='Random' fluid multiple selection options={availableActions.map(item => ({
                            key: item,
                            text: item.charAt(0).toUpperCase() + item.slice(1),
                            value: item
                          }))} onChange={handleChangeMode} />
                        </GridColumn>
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
                          <Button loading={isEmpty(livenessResult) || isEmpty(captureResult) || loadingResult} disabled={isEmpty(livenessResult) || loadingResult} onClick={() => getResultFromBe()}>Show result</Button>
                      </GridColumn>
                    </>
                   : 
                    <div></div>
                  }
                
            </GridRow>
        </Grid>
  
        { renderResultModal() }
    
  
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

export default Oz;