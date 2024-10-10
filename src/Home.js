import { Button, Container, Header, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleRegulaDocumentReader = () => {
    navigate('/regula-doc');
  }

  const handleRegulaLiveness = () => {
    navigate("/regula-doc-liveness");
  }

  const handleOz = () => {
    navigate("/oz-liveness");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Segment inverted color="blue" textAlign="center" padded="very">
        <Header as="h1" content="POC OZ/Regula" />
      </Segment>

      <Container style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleRegulaDocumentReader()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Document reader
          </Button>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleRegulaLiveness()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Document reader + Regula liveness
          </Button>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleOz()}
          >
            OZ Liveness
          </Button>
        </div>
      </Container>

      <Segment inverted textAlign="center" padded="very">
        <p>&copy; 2024 CSF</p>
      </Segment>
    </div>
  );
}

export default Home;