import styled from 'styled-components'

export const Toolbar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.panel};
`

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
`

export const RightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
`

export const CenterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: center;
`
