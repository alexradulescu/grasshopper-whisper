import { styled } from '@pigment-css/react'

export const Main = styled('main')({
  display: 'flex',
  height: '100dvh',
  width: '100%'
})

export const Aside = styled('aside')({
  width: '240px',
  borderRight: '1px solid black',
  flex: '0 0 auto'
})

export const ChatSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0'
})

export const ChatList = styled('div')({
  overflowY: 'auto',
  flex: '1 0 auto'
})

export const Form = styled('form')({
  display: 'flex',
  gap: '8px',
  width: '100%'
})

export const TextArea = styled('textarea')({
  flex: '1 0 auto',
  minHeight: '4lh'
})

export const ChatItem = styled('div')({
  display: 'flex',
  padding: '8px',
  gap: '8px'
})

export const Heading = styled('h2')({
  fontSize: '24px',
  fontWeight: '500',
  borderBottom: '1px solid black'
})
