import { Button, Container, Header, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleRegulaDocumentReader = () => {
    navigate('/regula-doc');
  }

  const handleRegulaLiveness = () => {
    navigate("/regula-liveness");
  }

  const handleOz = () => {
    navigate("/oz-liveness");
  }

  const handleRegulaDocsLiveness = () => {
    navigate("/regula-doc-liveness");
  }

  const handleRegulaDocsOz = () => {
    navigate("/regula-doc-liveness");
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
            Regula Liveness
          </Button>
          <Button
            fluid
            size="large"
            color="green"
            onClick={() => handleOz()}
            style={{ marginBottom: '1rem' }}
          >
            OZ Liveness
          </Button>
          <Button
            fluid
            size="large"
            color="blue"
            onClick={() => handleRegulaDocsLiveness()}
            style={{ marginBottom: '1rem' }}
          >
            Regula Docs + Liveness
          </Button>
          <Button
            fluid
            size="large"
            color="blue"
            onClick={() => handleRegulaDocsOz()}
          >
            Regula Docs + OZ Liveness
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
