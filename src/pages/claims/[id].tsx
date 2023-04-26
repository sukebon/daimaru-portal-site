/* eslint-disable @next/next/no-img-element */
//クレーム報告書　個別ページ
import React, { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { claimsState } from "../../../store";
import { todayDate } from "../../../functions";

import { ClaimSelectSendButton } from "../../components/claims/button/ClaimSelectSendButton";
import ClaimReport from "../../components/claims/ClaimReport";
import ClaimConfirmSendButton from "../../components/claims/button/ClaimConfirmSendButton";
import { ClaimEditButton } from "../../components/claims/button/ClaimEditButton";
import ClaimProgress from "../../components/claims/ClaimProgress";
import ClaimMessage from "../../components/claims/ClaimMessage";
import Link from "next/link";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import ClaimStampArea from "../../components/claims/ClaimStampArea";
import ClaimAccept from "../../components/claims/ClaimAccept";
import { useAuthStore } from "../../../store/useAuthStore";
import { ClaimEditReport } from "@/components/claims/ClaimEditReport";

//クレーム報告書作成

const ClaimId = () => {
  const router = useRouter();
  const queryId = router.query.id;
  const currentUser = useAuthStore((state) => state.currentUser);
  const users = useAuthStore((state) => state.users);
  const [claim, setClaim] = useState<any>([]); //クレームの個別記事を取得
  const [claims, setClaims] = useRecoilState<any>(claimsState); //クレーム一覧を取得
  const [edit, setEdit] = useState(false); //編集画面切替
  const [isoOfficeUsers, setIsoOfficeUsers] = useState<any>([]);
  const [isoManagerUsers, setIsoManagereUsers] = useState<any>([]);
  const [isoBossUsers, setIsoBossUsers] = useState<any>([]);
  const [isoTopManegmentUsers, setIsoTopManegmentUsers] = useState<any>([]);

  const [counterplanSelect, setCounterplanSelect] = useState(""); //対策選択
  const [counterplanContent, setCounterplanContent] = useState(""); //対策内容
  const [completionDate, setCompletionDate] = useState(""); //完了日

  const [receptionDate, setReceptionDate] = useState(todayDate); //受付日
  const [receptionNum, setReceptionNum] = useState(""); //受付NO.
  const [stampOffice, setStampOffice] = useState(""); //事務局ハンコ

  // クレーム報告書を取得;
  useEffect(() => {
    onSnapshot(doc(db, "claimList", `${queryId}`), (doc) => {
      setClaim({ ...doc.data(), id: doc.id });
    });
  }, [queryId, edit]);

  //クレーム報告書を受付、担当者に修正処置を依頼
  const acceptClaim = async (id: any) => {
    const docRef = doc(db, "claimList", id);
    await updateDoc(docRef, {
      status: 1,
      receptionist: currentUser,
      receptionNum,
      receptionDate,
      stampOffice: currentUser,
      operator: claim.stampStaff, //作業者
    });
    router.push(`/claims`);
  };

  //nextページ prevページのIDを取得
  const nextPrevPage = (id: any, page: number) => {
    let currentIndex = 0;
    claims.forEach((claim: any, index: number) => {
      if (claim.id == id) {
        currentIndex = index;
      }
    });
    const array = claims.filter((claim: any, index: number) => {
      if (currentIndex + page === index) return claim.id;
    });
    let nextId;
    if (array && array[0]) {
      nextId = array[0].id;
    }
    return nextId;
  };

  //各リストを取得
  useEffect(() => {
    //ISOマネージャーのリスト
    setIsoManagereUsers(
      users.filter((user: any) => {
        return user.isoManager === true;
      })
    );
    //ISO 上司のリスト
    setIsoBossUsers(
      users.filter((user: any) => {
        return user.isoBoss === true;
      })
    );
    //ISO トップマネジメントのリスト
    setIsoTopManegmentUsers(
      users.filter((user: any) => {
        return user.isoTopManegment === true;
      })
    );
    //ISO 事務局のリスト
    setIsoOfficeUsers(
      users.filter((user: any) => {
        return user.isoOffice === true;
      })
    );
  }, [users]);

  //事務局のみ編集可
  const enabledOffice = () => {
    const office = isoOfficeUsers.map((user: { uid: string }) => {
      return user.uid;
    });
    if (office.includes(currentUser)) return true;
    return false;
  };

  //記入者のみ編集可
  const enabledAuthor = () => {
    if (claim.author === currentUser) return true;
    return false;
  };

  //担当者のみ編集可
  const enabledStaff = () => {
    if (claim.stampStaff === currentUser) return true;
    return false;
  };

  //対策者のみ編集可
  const enabledCounterplan = () => {
    if (claim.operator === currentUser && Number(claim.status) === 3)
      return true;
    return false;
  };

  //上司のみ編集可
  const enabledBoss = () => {
    const boss = isoBossUsers.map((user: { uid: string }) => {
      return user.uid;
    });

    if (
      claim.operator === currentUser &&
      boss.includes(currentUser) &&
      Number(claim.status) === 5
    )
      return true;
    return false;
  };

  //上司と事務局のみ編集可
  const enabledBossAndOffice = () => {
    const office = isoOfficeUsers.map((user: { uid: string }) => {
      return user.uid;
    });
    const boss = isoBossUsers.map((user: { uid: string }) => {
      return user.uid;
    });

    if (
      ((claim.operator === currentUser || boss.includes(currentUser)) &&
        Number(claim.status) === 5) ||
      office.includes(currentUser)
    )
      return true;
    return false;
  };

  //管理者のみ編集可
  const enabledManager = () => {
    const manager = isoManagerUsers.map((user: { uid: string }) => {
      return user.uid;
    });
    if (
      (claim.operator === currentUser || manager.includes(currentUser)) &&
      Number(claim.status) === 6
    )
      return true;
    return false;
  };

  //Top Managementのみ編集可
  const enabledTopManegment = () => {
    const tm = isoTopManegmentUsers.map((user: { uid: string }) => {
      return user.uid;
    });
    if (
      (claim.operator === currentUser || tm.includes(currentUser)) &&
      Number(claim.status) === 7
    )
      return true;
    return false;
  };

  return (
    <>
      {claim && (
        <>
          <Box position="relative">
            <Flex justifyContent="space-between" color="gray.600">
              {nextPrevPage(queryId, 1) !== undefined ? (
                <Link href={`/claims/${nextPrevPage(queryId, 1)}`}>
                  <Flex alignItems="center">
                    <ArrowBackIcon />
                    前のクレーム
                  </Flex>
                </Link>
              ) : (
                <Box></Box>
              )}

              {nextPrevPage(queryId, -1) !== undefined ? (
                <Link href={`/claims/${nextPrevPage(queryId, -1)}`}>
                  <Flex alignItems="center">
                    次のクレーム
                    <ArrowForwardIcon />
                  </Flex>
                </Link>
              ) : (
                <Box></Box>
              )}
            </Flex>
            {/* クレームメッセージ */}
            <ClaimMessage
              claim={claim}
              currentUser={currentUser}
              users={users}
              enabledOffice={enabledOffice}
              enabledManager={enabledManager}
              enabledTopManegment={enabledTopManegment}
            />
            {/* ステータスの進捗 */}
            <ClaimProgress claim={claim} users={users} />

            {/* 編集ボタン 未処理以外「担当者」と「事務局」と「作業者」のみ*/}
            <ClaimEditButton
              claim={claim}
              edit={edit}
              setEdit={setEdit}
              enabledOffice={enabledOffice}
            />

            {/* レポート部分メイン */}
            <Box
              w={{ base: "full", md: "750px" }}
              mx="auto"
              p={6}
              bg="white"
              rounded="md"
              boxShadow="md"
            >
              {/* 通常画面 */}
              {!edit && <ClaimReport claim={claim} />}
              {/* 編集画面 */}
              {edit && <ClaimEditReport claim={claim} setEdit={setEdit} />}

              {/*'未処理 受付NO. 受付日 入力欄*/}
              <ClaimAccept
                claim={claim}
                queryId={queryId}
                enabledOffice={enabledOffice}
                receptionNum={receptionNum}
                setReceptionNum={setReceptionNum}
                receptionDate={receptionDate}
                setReceptionDate={setReceptionDate}
                acceptClaim={acceptClaim}
                // deleteClaim={deleteClaim}
              />

              {!edit && (
                <>
                  {/*決定ボタン*/}
                  <ClaimConfirmSendButton
                    claim={claim}
                    users={users}
                    currentUser={currentUser}
                    queryId={queryId}
                    receptionDate={receptionDate}
                    receptionNum={receptionNum}
                    counterplanSelect={counterplanSelect}
                    counterplanContent={counterplanContent}
                    completionDate={completionDate}
                    stampOffice={stampOffice}
                    operator={claim.operator}
                    enabledOffice={enabledOffice}
                    enabledBossAndOffice={enabledBossAndOffice}
                    enabledManager={enabledManager}
                    enabledTopManegment={enabledTopManegment}
                  />

                  {/* 担当者セレクトボタン　未処理以外　事務局のみ */}
                  {Number(claim.status) !== 0 && enabledOffice() && (
                    <ClaimSelectSendButton claim={claim} />
                  )}
                </>
              )}
            </Box>

            {/* スタンプエリア */}
            <ClaimStampArea claim={claim} users={users} />

            {/* 編集ボタン 未処理以外「担当者」と「事務局」と「作業者」のみ*/}
            <ClaimEditButton
              claim={claim}
              edit={edit}
              setEdit={setEdit}
              enabledOffice={enabledOffice}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default ClaimId;
