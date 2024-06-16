import { styled } from '@pigment-css/react'

export default function Home() {
  return (
    <Main>
      <Aside>
        <Heading>Chat History</Heading>
      </Aside>
      <ChatSection>
        <Heading>Chat</Heading>
        <ChatList>
          <ChatItem>User: One message</ChatItem>
          <ChatItem>AI: Second message</ChatItem>
        </ChatList>
        <Form>
          <TextArea></TextArea>
          <button>Send</button>
        </Form>
      </ChatSection>
    </Main>
  )
}

const Main = styled('main')({
  display: 'flex',
  height: '100dvh',
  width: '100%'
})

const Aside = styled('aside')({
  width: '300px',
  borderRight: '1px solid black',
  flex: '0 0 auto'
})

const ChatSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto'
})

const ChatList = styled('div')({
  overflowY: 'auto',
  flex: '1 0 auto'
})

const Form = styled('form')({
  display: 'flex',
  gap: '8px',
  width: '100%'
})

const TextArea = styled('textarea')({
  flex: '1 0 auto',
  minHeight: '4lh'
})

const ChatItem = styled('div')({
  display: 'flex',
  padding: '8px',
  gap: '8px'
})

const Heading = styled('h2')({
  fontSize: '24px',
  fontWeight: '500',
  borderBottom: '1px solid black'
})
