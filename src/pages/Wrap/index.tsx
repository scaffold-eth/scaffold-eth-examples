import React, { useState, useContext, useEffect} from 'react'
import { RefreshCw } from 'react-feather'
import { AutoColumn } from '../../components/Column'
import { AutoRow, RowBetween } from '../../components/Row'
import { ArrowWrapper, BottomGrouping, Wrapper } from '../../components/swap/styleds'
import { ThemeContext } from 'styled-components'
import { ButtonLight } from '../../components/Button'
import { useWalletModalToggle } from '../../state/application/hooks'
import Modal from '../../components/Modal'
import { isAddress} from "ethereum-address"

import {TYPE } from '../../theme'
import AppBody from '../AppBody'
import { Input as NumericalInput } from '../../components/NumericalInput'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useAllTokens } from '../../hooks/Tokens'
import {useRecoilValue} from 'recoil';
import {loggedInState, userState} from "../../state/user";
import { CardSection, DataCard} from '../../components/earn/styled'
import { X } from 'react-feather'

export default function Swap({ history }: RouteComponentProps) {
  const theme = useContext(ThemeContext)
  const [inputValue, setInputValue] = useState("")
  const [addressModal, setAddressModal] = useState(false)
  const [ETHAddressErrText, setETHAddressErrText] = useState("")
  const [ETHAddress, setETHAddress] = useState("")
  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (account) {
      setETHAddress(account)
    }
  }, []);

  function handleInputValue(val:string) {
    setInputValue(val)
  }

  async function updateETHAddress(e:any) {
    let address = e.target.value.trim()
    const isValid = isAddress(address)
    if (!isValid || address.length <= 0) {
      setETHAddressErrText("Invalid ETH address")
    }
    else {
      setETHAddressErrText("")
    }
    setETHAddress(address)
  }

  const toggleWalletModal = useWalletModalToggle()
  const user = useRecoilValue(userState);
  const isLoggedIn = useRecoilValue(loggedInState);
  const allTokens = useAllTokens()

  var WBCLTToken = allTokens["0xE41d2489571d322189246DaFA5ebDe1F4699F498"]
  let WBCLTBalance = useCurrencyBalance(account ?? undefined, WBCLTToken ?? undefined)
  let BCLTBalance = 0
  if (isLoggedIn) {
    BCLTBalance = user.balance.bitclout
  }

  const [direction, setDirection] = useState(true)
  const [from, setFrom] = useState("BCLT")
  const [to, setTo] = useState("WBCLT")
  function swapInputOutput() {
    console.log(direction)
    if (from == "BCLT") {
      setDirection(false)
      setFrom("WBCLT")
      setTo("BCLT")
    }
    else {
      setDirection(true)
      setFrom("BCLT")
      setTo("WBCLT")
    }
  }

  function wrapBCLT() {
    console.log('wrapBCLT')
    setAddressModal(true)
  }

  function unwrapBCLT() {
    console.log('unwrapBCLT')
    setAddressModal(true)
  }

  const handleETHAddressConfirm = () => {
    console.log(ETHAddress)
    setAddressModal(false)
  }
  
  const StyledSwapHeader = styled.div`
  padding: 20px 1rem 5px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`


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

  return (
    <>
      <AppBody>
      <Modal isOpen={addressModal} onDismiss={() => setAddressModal(false)}>
      <ContentWrapper gap="lg">
      <ModalUpper>
        <div style={{background:theme.bg1, width:'100%'}}>
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color={theme.text1}>Confirm ETH Address</TYPE.white>
            <StyledClose stroke={theme.text1} onClick={() => setAddressModal(false)} />
          </RowBetween>
        </CardSection>
        </div>
        <div style={{background:theme.bg2, width:'100%'}}>
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <form onSubmit={()=>handleETHAddressConfirm()}>
              <h3 style={{fontSize:14, color:theme.text2, fontWeight:500}}>Enter Your ETH Address</h3>
            <input key="input1" autoFocus={true} onChange={updateETHAddress} value={ETHAddress} type="text" placeholder="ETH Address" style={{width:'100%', outline: 'none', height:50, borderRadius:10, border:'1px solid ' + theme.bg3, background:'none', color:theme.text3, fontWeight:500, fontSize:16, paddingLeft:10, paddingRight:10,}}/>
            {ETHAddressErrText!=""?
            <button disabled={true} style={{marginTop:20, background:theme.bg3, width:'100%', height:50, borderRadius:15, border:'none'}}><span style={{color:theme.text2, fontSize:20, fontWeight:500}}>Confirm</span></button>:
            <button type="submit" style={{marginTop:20, background:theme.primary1, width:'100%', height:50, borderRadius:15, border:'none'}}><span style={{color:"#fff", fontSize:20, fontWeight:500}}>Confirm</span></button>
            }
            </form>
              <span style={{color:'tomato', fontSize:16, fontWeight:400, paddingLeft:15, paddingRight:15, textAlign:'center'}}>{ETHAddressErrText}</span>
          </AutoColumn>
      </CardSection>
      </div>
      </ModalUpper>
    </ContentWrapper>
      </Modal>
      <StyledSwapHeader>
      <RowBetween>
        <TYPE.black fontWeight={500}>Wrap</TYPE.black>
      </RowBetween>
    </StyledSwapHeader>
        <Wrapper id="wrap-page">

          <AutoColumn gap={'md'}>
            <div style={{marginTop:3, flexDirection:'column', width: '100%', height:90, border:'1px solid ' + theme.bg2, borderRadius:20,}}>
              <div style={{flex:0.2, display:'flex', flexDirection:'row',}}>
                <div style={{flex:0.5, paddingLeft:16, paddingTop:11, textAlign:'left', fontSize:14, color:theme.text2, fontWeight:500}}>From</div>
                <div style={{flex:0.5, paddingRight:16, paddingTop:11, textAlign:'right', fontSize:14, color:theme.text2, fontWeight:500}}>Balance: {(from == "WBCLT"?(account?WBCLTBalance?.toSignificant(6):'0'):parseFloat(BCLTBalance.toPrecision(6)))}</div>
              </div>
              <div style={{flex:0.8, display:'flex', flexDirection:'row', marginTop:12,}}>
                <div style={{flex:0.6, display:'flex', marginLeft:16,}}>
                <NumericalInput
                className="token-amount-input"
                value={inputValue}
                onUserInput={val => {
                  handleInputValue(val)
                }}
              />
                </div>
                <div style={{flex:0.4, display:'flex', justifyContent:'flex-end', paddingRight:15}}>
                  <div style={{color:theme.text1, paddingLeft:15, paddingRight:15, height:37, borderRadius:10, backgroundColor:theme.bg2, display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:500}}>
                    {from == "BCLT"?<img src={require('../../assets/WBCLT-logo.png')} style={{width:30, height:30, borderRadius:100, marginRight:10,}}/>:<img src={require('../../assets/WBCLT-logo.png')} style={{width:30, height:30, borderRadius:100, marginRight:10,}}/>}
                    {from}
                  </div>
                </div>
              </div>
            </div>

            <AutoColumn justify="space-between">
              <AutoRow justify={'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <RefreshCw
                    size="16"
                    onClick={() => {
                      swapInputOutput()
                    }}
                    color={theme.primary1}
                  />
                </ArrowWrapper>
              </AutoRow>
            </AutoColumn>
            <div style={{flexDirection:'column', width: '100%', height:90, border:'1px solid ' + theme.bg2, borderRadius:20,}}>
              <div style={{flex:0.2, display:'flex', flexDirection:'row',}}>
                <div style={{flex:0.5, paddingLeft:16, paddingTop:11, textAlign:'left', fontSize:14, color:theme.text2, fontWeight:500}}>To</div>
                <div style={{flex:0.5, paddingRight:16, paddingTop:11, textAlign:'right', fontSize:14, color:theme.text2, fontWeight:500}}>Balance: {(to == "WBCLT"?(account?WBCLTBalance?.toSignificant(6):'0'):parseFloat(BCLTBalance.toPrecision(6)))}</div>
              </div>
              <div style={{flex:0.8, display:'flex', flexDirection:'row', marginTop:12,}}>
                <div style={{flex:0.6, display:'flex', marginLeft:16,}}>
                <NumericalInput
                className="token-amount-input"
                value={inputValue}
                onUserInput={val => {
                  setInputValue(val)
                }}
              />
                </div>
                <div style={{flex:0.4, display:'flex', justifyContent:'flex-end', paddingRight:15}}>
                  <div style={{color:theme.text1, paddingLeft:15, paddingRight:15, height:37, borderRadius:10, backgroundColor:theme.bg2, display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:500}}>
                    {to == "BCLT"?<img src={require('../../assets/WBCLT-logo.png')} style={{width:30, height:30, borderRadius:100, marginRight:10,}}/>:<img src={require('../../assets/WBCLT-logo.png')} style={{width:30, height:30, borderRadius:100, marginRight:10,}}/>}
                    {to}
                  </div>
                </div>
              </div>
            </div>
          </AutoColumn>
          <BottomGrouping>
            {
            !account?
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>:
            (inputValue == ""?
            <button style={{marginTop:12, background:theme.bg3, width:'100%', height:62, borderRadius:20, border:'none'}}><span style={{color:theme.text3, fontSize:20, fontWeight:500}}>Enter an amount</span></button>:
            direction?
            <button onClick={wrapBCLT} style={{marginTop:12, background:theme.primary1, width:'100%', height:62, borderRadius:20, border:'none'}}><span style={{color:'#fff', fontSize:20, fontWeight:500}}>Wrap Bitclout</span></button>:<button onClick={unwrapBCLT} style={{marginTop:15, background:'#2172e5', width:'100%', height:60, borderRadius:15, border:'none'}}><span style={{color:'#fff', fontSize:20, fontWeight:500}}>Unwrap Bitclout</span></button>)
          }
          </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}
