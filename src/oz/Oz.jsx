import React from 'react';
import { Segment, Container, Header } from 'semantic-ui-react';

const Oz = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Segment inverted color="blue" textAlign="center" padded="very">
          <Header as="h1" content="OZ Liveness" />
        </Segment>
  
        <Container style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '300px' }}>
            Sorry, not ready yet...
          </div>
        </Container>
  
        <Segment inverted textAlign="center" padded="very">
          <p>&copy; 2024 CSF</p>
        </Segment>
      </div>
    )
}

export default Oz;