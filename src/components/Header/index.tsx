import { ChainId } from '@uniswap/sdk'
import React, { useState } from 'react'
import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'react-feather'
import styled from 'styled-components'

import Logo from '../../assets/bitswap_small.png'
import LogoDark from '../../assets/bitswap_small.png'
import { X } from 'react-feather'

import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { TYPE, ExternalLink } from '../../theme'

import { YellowCard } from '../Card'
import Menu from '../Menu'

import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import Modal from '../Modal'
import UniBalanceContent from './UniBalanceContent'
import { CardSection, DataCard} from '../earn/styled'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import {loggedInState, userState} from "../../state/user";
import {loginUser, logoutUser} from "../../state/user/services";
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {colors} from '../../theme'


const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: #2c2f36;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  /* border-bottom: 1px solid ${({ theme }) => theme.bg2}; */
  padding: 1rem;
  z-index: 21;
  /* background-color: ${({ theme }) => theme.bg1}; */
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 120px 1fr;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const HeaderElementWrap = styled.div`
  display: flex;
  align-items: center;
`

const HeaderRow = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg1};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg2)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  :focus {
    border: 1px solid blue;
  }
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const NetworkCard = styled(YellowCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 12px;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: none;
`}
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg2};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const themeColors:any = colors(darkMode);

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)

  const isLoggedIn = useRecoilValue(loggedInState);
  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);
  const [loginModal, setLoginModal] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")

  const openLoginModal = () => {
    setLoginModal(!loginModal)
  }

  const openLogoutModal = () => {
    setLogoutModal(!logoutModal)
  }

  const updateUsername = () => {
    let username = (document.getElementById('username') as HTMLInputElement).value.trim()
    setUsername(username)
  }

  const updatePassword = () => {
    let password = (document.getElementById('password') as HTMLInputElement).value.trim()
    setPassword(password)
  }

  const handleLogin = () => {
    loginUser(username.trim(), password.trim())
      .then(async (response:any) => {
        if (response.status === 200) {
          await localStorage.setItem("user", JSON.stringify(response.data));
          await setUser(response.data);
          setLoginModal(false)
          window.location.assign("/");
        } else {
          console.log(response.data);
          setErrorText(response.data);
        }
      })
      .catch((error: any) => {
        if (error.response) {
          if (error.response.data.error.text) {
            setErrorText(error.response.data.error.text);
          }
          else {
            setErrorText(error.response.data.error);
          }
        } else {
          console.log(error.message);
          setErrorText(error.message);
        }
      });
  };

  const handleLogout = () => {
      logoutUser()
      setUser(null);
      setLogoutModal(false)
      window.location.assign("/");
  }

  return (
    <HeaderFrame>
      <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal>
      <Modal isOpen={loginModal} onDismiss={() => setLoginModal(false)}>
      <ContentWrapper gap="lg">
      <ModalUpper>
        <div style={{background:themeColors.bg1, width:'100%'}}>
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color={themeColors.text1}>Login to Bitswap</TYPE.white>
            <StyledClose stroke={themeColors.text1} onClick={() => setLoginModal(false)} />
          </RowBetween>
        </CardSection>
        </div>
        <div style={{background:themeColors.bg2, width:'100%'}}>
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <form onSubmit={()=>handleLogin()}>
            <input id="username" onChange={() => updateUsername()}  type="text" placeholder="Username" style={{width:'100%', outline: 'none', marginTop:10, height:50, borderRadius:10, border:'1px solid ' + themeColors.bg3, background:'none', color:themeColors.text3, fontWeight:500, fontSize:16, paddingLeft:10, paddingRight:10,}}/>
            <input id="password" onChange={() => updatePassword()}  type="password" placeholder="Password" style={{width:'100%', outline: 'none', marginTop:10, height:50, borderRadius:10, border:'1px solid ' + themeColors.bg3, background:'none', color:themeColors.text3, fontWeight:500, fontSize:16, paddingLeft:10, paddingRight:10,}}/>
            {username == "" || password == ""?
            <button style={{marginTop:15, background:themeColors.bg3, width:'100%', height:60, borderRadius:15, border:'none'}}><span style={{color:themeColors.text2, fontSize:20, fontWeight:500}}>Login</span></button>:
            <button type="submit" style={{marginTop:15, background:themeColors.primary1, width:'100%', height:60, borderRadius:15, border:'none'}}><span style={{color:"#fff", fontSize:20, fontWeight:500}}>Login</span></button>
            }
            </form>
              <span style={{color:'tomato', fontSize:16, fontWeight:400, paddingLeft:15, paddingRight:15, textAlign:'center'}}>{errorText}</span>
              <span style={{color:themeColors.text3, fontSize:16, fontWeight:400, paddingLeft:15, paddingRight:15, textAlign:'center'}}>Don't have a bitswap account?<br/><a href="http://app.bitswap.network/register" style={{color:themeColors.primarytext1}}>Create Account</a></span>
          </AutoColumn>
      </CardSection>
      </div>
      </ModalUpper>
    </ContentWrapper>
      </Modal>

      <Modal isOpen={logoutModal} onDismiss={() => setLogoutModal(false)}>
      <ContentWrapper gap="lg">
      <ModalUpper>
        <div style={{background:themeColors.bg1, width:'100%'}}>
        <CardSection gap="md">
          <RowBetween>
            {user?<TYPE.white color={themeColors.text1}>Logout of {user.username}?</TYPE.white>:<TYPE.white color="white">Logout of Bitswap</TYPE.white>}
            <StyledClose stroke={themeColors.text1} onClick={() => setLogoutModal(false)} />
          </RowBetween>
        </CardSection>
        </div>
        <div style={{background:themeColors.bg2, width:'100%'}}>
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <div style={{width:'100%', display:'flex', flexDirection:'column'}}>
              <div style={{display:'flex', flexDirection:'row', margin:15}}>
                  <div style={{display:'flex', flex:0.2}}>
                    {isLoggedIn?<img src={user.bitclout.profilePicture} style={{width:80, height:80, borderRadius:80}}/>:null}
                  </div>
                  {isLoggedIn?
                  <div>
                    <div style={{display:'flex', flex:0.8, flexDirection:'column', marginLeft:22, marginTop:2}}>    
                        <span style={{fontSize:20, fontWeight:600, color:themeColors.text1}}>{user.username}</span>
                        <span style={{fontSize:14, fontWeight:300, marginTop:5, color:themeColors.text1}}>{user.email}</span>
                        <span style={{fontSize:16, fontWeight:400, marginTop:10, color:themeColors.text1}}>{user.bitclout.bio}</span>
                    </div>
                    <div style={{display:'flex', flexDirection:'row', background:themeColors.bg1, borderRadius:12, marginLeft:22, alignSelf:'flex-start'}}>
                    <a href="https://app.bitswap.network/" style={{paddingLeft:15, paddingRight:15, height:40, background:themeColors.bg2, border:'4px solid ' + themeColors.bg1, borderRadius:10, display:'flex', textDecoration:'none', alignItems:'center'}}>
                      <p style={{ fontSize:16, fontWeight:500, color:themeColors.text1, whiteSpace:'nowrap'}}>Manage BCLT Balance</p>
                    </a>
                    <div style={{height:40, paddingLeft:10, paddingRight:15, borderRadius:10, display:'flex', alignItems:'center'}}>
                      <p style={{ fontSize:16, fontWeight:500, color:themeColors.text1, whiteSpace:'nowrap'}}>{user.balance.bitclout} BCLT</p>
                    </div>
                  </div>
                </div>:null}
              </div>
              </div>
            <button onClick={()=>handleLogout()} style={{height:50, marginLeft:30, marginRight:30, backgroundColor:darkMode?'#481c1c':'#fac3be', border:'1px solid ' + themeColors.red1, borderRadius:20, fontSize:20, fontWeight:500, color:themeColors.red1,}}>
                Logout
            </button>
            </AutoColumn>
      </CardSection>
      </div>
      </ModalUpper>
    </ContentWrapper>
      </Modal>


      <HeaderRow>
        <Title href=".">
          <UniIcon>
            <img width={'24px'} src={darkMode ? LogoDark : Logo} alt="logo" />
          </UniIcon>
        </Title>
        {!isLoggedIn?<button onClick={()=>openLoginModal()} style={{paddingLeft:15, paddingRight:15, height:40, background:themeColors.primary5, border:'1px solid ' + themeColors.primary5, borderRadius:12, display:'flex', alignItems:'center'}}>
          <p style={{ fontSize:16, fontWeight:500, color:themeColors.primaryText1, whiteSpace:'nowrap'}}>Login to Bitswap</p>
        </button>:
        <div style={{display:'flex', flexDirection:'row', background:themeColors.bg1, borderRadius:12}}>
        <button onClick={()=>openLogoutModal()} style={{paddingLeft:15, paddingRight:15, height:40, background:themeColors.bg2, border:'4px solid ' + themeColors.bg1, borderRadius:10, display:'flex', alignItems:'center'}}>
          <p style={{ fontSize:16, fontWeight:500, color:themeColors.text1, whiteSpace:'nowrap'}}>{user.username.toUpperCase()}</p>
        </button>
        <div style={{height:40, paddingLeft:10, paddingRight:15, borderRadius:10, display:'flex', alignItems:'center'}}>
          <p style={{ fontSize:16, fontWeight:500, color:themeColors.text1, whiteSpace:'nowrap'}}>{user.balance.bitclout} BCLT</p>
        </div>
        </div>
        
        }
      </HeaderRow>
      <HeaderLinks>
      <StyledNavLink id={`wrap-nav-link`} to={'/wrap'}>
          {t('Wrap')}
        </StyledNavLink>
        <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
          {t('swap')}
        </StyledNavLink>
        <StyledNavLink
          id={`pool-nav-link`}
          to={'/pool'}
          isActive={(match, { pathname }) =>
            Boolean(match) ||
            pathname.startsWith('/add') ||
            pathname.startsWith('/remove') ||
            pathname.startsWith('/increase') ||
            pathname.startsWith('/find')
          }
        >
          {t('pool')}
        </StyledNavLink>
        <StyledExternalLink id={`stake-nav-link`} href={'https://bitswap.network'}>
          Bitswap <span style={{ fontSize: '11px', textDecoration: 'none !important' }}>↗</span>
        </StyledExternalLink>
      </HeaderLinks>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} ETH
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu account={account}/>
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}