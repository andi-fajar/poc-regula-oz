import { useState, useRef, useEffect } from 'react';
import { Segment, Container, Header } from 'semantic-ui-react';
import { isEmpty } from 'lodash';




const Oz = () => {
  const [captureResult, setCaptureResult] = useState({});
  const [livenessResult, setLivenessResult] = useState({});


  const handleOpenDemo = () => {
    window.OzLiveness.open({
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Segment inverted color="blue" textAlign="center" padded="very">
            <Header as="h1" content="OZ Liveness" />
          </Segment>
    
          <Container style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={handleOpenDemo}>Open Demo</button>
            <div>
              { !isEmpty(captureResult) && <img src={captureResult.best_frame}></img> }
            </div>
            <div>
              { !isEmpty(captureResult) && <p>Liveness Result : ${livenessResult.folder_state}</p> }
            </div>
          </Container>


    
          <Segment inverted textAlign="center" padded="very">
            <p>&copy; 2024 CSF</p>
          </Segment>
      </div>
    )
}

export default Oz;