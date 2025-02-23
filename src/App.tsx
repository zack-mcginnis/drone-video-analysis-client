import styled from '@emotion/styled';
import GlobalStyles from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 1rem;
`;

const Header = styled.header`
  margin-bottom: 1rem;
`;

const Main = styled.main`
  max-width: 100%;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 768px;
  }

  @media (min-width: 1024px) {
    max-width: 1024px;
  }
`;

function App() {
  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header>
          <h1>My PWA</h1>
        </Header>
        <Main>
          <p>Welcome to my Progressive Web App!</p>
        </Main>
      </AppContainer>
    </>
  );
}

export default App;
