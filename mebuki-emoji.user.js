// ==UserScript==
// @name         めぶきちゃん 絵文字にマウス乗せると拡大
// @namespace    https://raw.githubusercontent.com/sissis-source/
// @version      2026.06.08
// @description  めぶきちゃんの絵文字にマウスを乗せると拡大表示するユーザースクリプト
// @author       sissis
// @match        https://mebuki.moe/app/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @downloadURL  https://raw.githubusercontent.com/sissis-source/mebuki-emoji-userscript/refs/heads/main/mebuki-emoji.user.js
// @updateURL    https://raw.githubusercontent.com/sissis-source/mebuki-emoji-userscript/refs/heads/main/mebuki-emoji.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ---- ユーティリティ ----

  function throttle(fn, interval) {
    let lastTime = 0;
    let timer = null;
    return (...args) => {
      const now = Date.now();
      const remaining = interval - (now - lastTime);
      if (remaining <= 0) {
        lastTime = now;
        fn(...args);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          lastTime = Date.now();
          fn(...args);
        }, remaining);
      }
    };
  }

  function getFileName(url) {
    return url.split('/').pop().split('?')[0];
  }

  // ---- 絵文字キャッシュ ----

  const emojiCache = (() => {
    const icons = [
      { alt: ":soudane:", file: "m414ufodim5ptodzuf56uom3.webp" },
      { alt: ":otukare:", file: "gqmaco39gqb9im9h5pik0hk3.webp" },
      { alt: ":odaijini:", file: "pxme6iszerel80avucugzovf.webp" },
      { alt: ":sorena:", file: "f9mq92j46cpi2jxbggi4ou9q.webp" },
      { alt: ":soukana:", file: "c62r063vzj7z0lo13cuprsha.webp" },
      { alt: ":soukamo:", file: "f007z27uqv7aa1of5773fbad.webp" },
      { alt: ":souwayo:", file: "bngca7qz5m1emqyqm4zded2a.webp" },
      { alt: ":sonnani:", file: "vj5123eonbslqr0l8qavcvd4.webp" },
      { alt: ":sondake:", file: "i90863rvwwhfe8ks2z14chjo.webp" },
      { alt: ":kawaii:", file: "pitwte9pta5r5ykyzaww04fl.webp" },
      { alt: ":H_da:", file: "zb63hvappgonehpkt5wjtoaa.webp" },
      { alt: ":uodekka_boost:", file: "qcjdi0jyiggj52ksmdapuogm.webp" },
      { alt: ":hinnyuu_kansya:", file: "ysvn48n3napx1ybeqra5iyrv.webp" },
      { alt: ":dekapai_kansya:", file: "u401v8zub9tff7hojqegzfkr.webp" },
      { alt: ":dousite:", file: "rx5tugosl24q0xfvpl574y4m.webp" },
      { alt: ":sirason:", file: "igqs6cnl52o8oopt8ie4h8lt.webp" },
      { alt: ":iiyone:", file: "h7c28nvalkvgnjzotvxugyza.webp" },
      { alt: ":ii:", file: "igkowcr2p6oq2uvq5ng2ts5k.webp" },
      { alt: ":naruhodo:", file: "z3fbn94qhb0imc03016msav0.webp" },
      { alt: ":wakaru:", file: "is7xydg7v7e6o7q1nwatho6q.webp" },
      { alt: ":sorehasou:", file: "k7t4rtq0ot7tmvsk3ehbp3fc.webp" },
      { alt: ":donmai:", file: "bksvxrcv0ay8t5lqvuyys49t.webp" },
      { alt: ":ganbare:", file: "itqe8carkq6uqx36an453hwl.webp" },
      { alt: ":sikatanasi:", file: "eqero9j8b5kx4j2qzhgwb8ha.webp" },
      { alt: ":uwakitsu:", file: "h3t98ozk4kssj2ove0h464dz.webp" },
      { alt: ":yokunai:", file: "utuujqfq3pbbzi3nzt3pfqhe.webp" },
      { alt: ":sorehadame:", file: "w7yn863n8qgwd19xgevqoj8z.webp" },
      { alt: ":damare_kozou:", file: "f3brrbb2qq3j5f6lklyxim5n.webp" },
      { alt: ":erai:", file: "fizto759uxtnp0vwxckt0ulu.webp" },
      { alt: ":kansya:", file: "cxxwyn4yqxg4ij2yz5a2wgzy.webp" },
      { alt: ":sutekidane:", file: "tz2lbxtzy5k5qnkd9ag3pkxh.webp" },
      { alt: ":tekidane:", file: "xdl30ftxisodkyhnwxsuttzt.webp" },
      { alt: ":sugoiwa:", file: "v4m03n19e0qecwze0ar82uup.webp" },
      { alt: ":damedatta:", file: "l1copoc6ets4ouxwb2jls07o.webp" },
      { alt: ":kodokuno_ikenai:", file: "vo9hoysekvjrmdnfh3h3okyf.webp" },
      { alt: ":chimpodawa:", file: "mhjf94f0m9gmuwde345byof3.webp" },
      { alt: ":manko_dawa:", file: "m0nb37uimoegootfggs02sc5.webp" },
      { alt: ":tashi_crab:", file: "nrg58g066t4jkgtcy5rkjbxj.webp" },
      { alt: ":tashikani_onimai:", file: "cyuej61eww08icuny9xai9af.webp" },
      { alt: ":kashikoi:", file: "gkcphu9jhffesstv97j3symt.webp" },
      { alt: ":sayou:", file: "qlv28d127hvyl2l0lor42yxx.webp" },
      { alt: ":usoda_ne:", file: "untqqiwnb1zqr3qlownb2h9n.webp" },
      { alt: ":waha:", file: "hbna30g8f7fzr06rv3dff1w8.webp" },
      { alt: ":taiari:", file: "koz62dxbfgxr8331apd3of6a.webp" },
      { alt: ":death:", file: "wgvkoxoiuf5otbj367nekfp6.webp" },
      { alt: ":nen:", file: "psz3famxa1cc28uijdvh7ljr.webp" },
      { alt: ":kan:", file: "zwwamwipnkkfacyvpebd3g3c.webp" },
      { alt: ":zaaako:", file: "r37jocbfttdejubaakmq9tgn.webp" },
      { alt: ":deb:", file: "itt7lf9vq9wk5a4t1nza7byf.webp" },
      { alt: ":yoshi:", file: "pb8hq1jc8n2o6u9ykmjr0v3w.webp" },
      { alt: ":daizyoubudesu:", file: "eoiejs31sm9v3p0encb2waen.webp" },
      { alt: ":iwankottyaNIGHT:", file: "sx6slnetrrvwov82aatv24ty.webp" },
      { alt: ":doushite:", file: "fad9e4cxmbgb5b3g45uegha3.webp" },
      { alt: ":nanimowakaranai_boost:", file: "kd6x5h7tb1b8norpmktlg5t4.webp" },
      { alt: ":hayarukamo:", file: "qnau54tkc1rsrbxum80qg5n8.webp" },
      { alt: ":mujiina:", file: "izj6r9hunwqycfi9b3dmaqtn.webp" },
      { alt: ":homo:", file: "pl7xysuussgfygcnrge06m71.webp" },
      { alt: ":dora_jitome:", file: "y7ag3ypzj571be0cv4znswm3.webp" },
      { alt: ":konohito_homodesu:", file: "fst2zmxzky5f4pqm5rnajzop.webp" },
      { alt: ":Karyl:", file: "z2jdce4ipai3cb8ln0c15ssi.webp" },
      { alt: ":Karyl_kissyo:", file: "fxeuiqdc5tc78m9jwtg1trdq.webp" },
      { alt: ":Karyl_Yabaiwayo_Hennyusei:", file: "zqrw5tjjymyfzrc7bt3zotwt.webp" },
      { alt: ":yappa_tureewa:", file: "am7h0s2q0jocyhlypgo99iqj.webp" },
      { alt: ":kowaa:", file: "u645c1og5nwc3drqnmz2wep9.webp" },
      { alt: ":ko_kowai:", file: "ia6dntqsa5cvji7vyeyziofs.webp" },
      { alt: ":kowa:", file: "ef5avp2ogpx4argv8h0l3snj.webp" },
      { alt: ":sore_mazi_yabai:", file: "jf1ay8r8oguiafnhpjiaafa3.webp" },
      { alt: ":kawaisou:", file: "uen73fr5ehrwx2sp7e1ru8zr.webp" },
      { alt: ":kakkoii:", file: "lknbampwt5gch7r8o823zf9f.webp" },
      { alt: ":yokuneeyo:", file: "yiko5fmbuyshzvq3cg0t3cm6.webp" },
      { alt: ":danaon_konwaku:", file: "mmf9qhgn64apdnarszfx744t.webp" },
      { alt: ":kagen_siro_baka:", file: "loh9ebtlk5kfk4voa1hqepvc.webp" },
      { alt: ":nannanda:", file: "ynd0sr4r840u4fnwcdehymym.webp" },
      { alt: ":haa:", file: "d0mqtau7hl671holvbcj4c8q.webp" },
      { alt: ":wakaru2:", file: "aoinopq6z9rpce69c12pm4fd.webp" },
      { alt: ":sukoshinaku:", file: "s2aqgq6s8fw9lp5fpj2c0scy.webp" },
      { alt: ":jyusei:", file: "svapvvclp05m28gmla10seiq.webp" },
      { alt: ":nanika_mondai_demo:", file: "kjpz4oc0lyrdn4k53hvm97kl.webp" },
      { alt: ":totemo_turai:", file: "z0hygwgvccc3ge121c8dskqa.webp" },
      { alt: ":yadaaaa_addon:", file: "k4dnofpy7uv06bzjhcct7nnf.webp" },
      { alt: ":dante_h_boost:", file: "bl073bs93q8dfm6h5ryba1m4.webp" },
      { alt: ":kireorga_boost:", file: "vp0b966eainyjxn15bizulpb.webp" },
      { alt: ":anome_boost:", file: "plxu6tc85o7yi317hbtproco.webp" },
      { alt: ":Kaede_huhutte:", file: "uinoypixz471fzkubruht8ep.webp" },
      { alt: ":yamada_boost:", file: "n5v5phrvyygnedwdq05dut96.webp" },
      { alt: ":ichikawa_boost:", file: "o2sn4nd3w6lk7ixt09hgn26k.webp" },
      { alt: ":ebicurry_azurlane_boost:", file: "jhjxx8idfg75kyq7ez4hoii0.webp" },
      { alt: ":coffee_umasi_boost:", file: "xdowhrmolgze2jqji5bf1xgs.webp" },
      { alt: ":jcb_boost:", file: "yrqot6zscwa1kdxzldn59py7.webp" },
      { alt: ":JCBchang_maru:", file: "ujbvodn4us6mwhf0ifwhnvux.webp" },
      { alt: ":JCBchang_batsu:", file: "f089pcoxk3se5vdlfajuyuv4.webp" },
      { alt: ":jcb_404_crying:", file: "nypqni0elb53pd76033p10ug.webp" },
      { alt: ":jcb_dekiraa:", file: "p6qtdhmsbfi29agaj964i9n1.webp" },
      { alt: ":kakutei_boost:", file: "zyj60spmp4zd5nyo83jmv1mp.webp" },
      { alt: ":umasou_boost:", file: "n1o282rk4mqc8a3gtsjcqs89.webp" },
      { alt: ":onakasuita:", file: "byfehsq1a41i8wvj9vrk2ft2.webp" },
      { alt: ":Washinoja_PowerChan_Test:", file: "z0dp2g9hgbddn2c97xlgd9bq.webp" },
      { alt: ":big_ban_burn_bakedmochocho:", file: "xwwrcj14hxuc1rfyuis61frm.webp" },
      { alt: ":akane3:", file: "jdwcfu58db7tgfkclwkrpf75.webp" },
      { alt: ":gaoru:", file: "ltnrmu2oy4fr5vt8btd2q7iv.webp" },
      { alt: ":Amamiya:", file: "i94eyecsp5afr9n2on0sid6f.webp" },
      { alt: ":anchinsama:", file: "t0xhddakm9zujawyj6d7t7kl.webp" },
      { alt: ":anome:", file: "w8y8gexam66ul2w6kxf67zk7.webp" },
      { alt: ":aridesune:", file: "hoqhmfuqrzk19erjom4dsjfp.webp" },
      { alt: ":arigatou:", file: "zxa03y898iqjjw5q6hyi0mlk.webp" },
      { alt: ":ARONA:", file: "nocd4i3x42xzdbn1l4mbnm3q.webp" },
      { alt: ":aruchan:", file: "jsv947c6qiihzf3vyskvpqm8.webp" },
      { alt: ":asuranmakka:", file: "dezv7jvz2jaapu6vmkpa39as.webp" },
      { alt: ":Dante:", file: "ukjs25rs06usa3qhlzgzwj34.webp" },
      { alt: ":atarimae:", file: "ur000j5xvwfewf40kjsia8h3.webp" },
      { alt: ":frieren:", file: "qb5tv170rzz7dgsttanw8e71.webp" },
      { alt: ":balom:", file: "x6l6toww0gabv0ougfp0vh9s.webp" },
      { alt: ":chadan:", file: "kfqy5u6r21s8ppqnj2v8jkt5.webp" },
      { alt: ":soujanai:", file: "qo4pyokdczc59hud05zvvte3.webp" },
      { alt: ":Columbus:", file: "c6c5erl60w1jwuoe3bupi7ig.webp" },
      { alt: ":vader_inv:", file: "jnxwnacqdbzvyokp9joultsb.webp" },
      { alt: ":kimo:", file: "bfmhv871m2dfzxeqow7lkua9.webp" },
      { alt: ":Fenrys:", file: "jz8ihevf8pp8vahm4bflkbjf.webp" },
      { alt: ":dareda:", file: "rekivntvcodymxsptdoq2spp.webp" },
      { alt: ":kyoufu:", file: "kip5wxf6siernsei9leo0sjs.webp" },
      { alt: ":demaecan:", file: "q30391d8t602gtccsujnhpk7.webp" },
      { alt: ":Denjirou:", file: "dg1iuu4ut6de9ghu7c0k49qd.webp" },
      { alt: ":pikachu:", file: "bjbtveeq88t6gtks4nin9i0e.webp" },
      { alt: ":doro:", file: "r5se07nd7r7bzbzzs9etcxm8.webp" },
      { alt: ":0810:", file: "ufn9k3cl0vh0lob4q0v6crdd.webp" },
      { alt: ":naniwo:", file: "u01og0d5qzk7l4e0y0tvyu03.webp" },
      { alt: ":emmy:", file: "lqrgp2sbt7kjql7it60wzfel.webp" },
      { alt: ":254:", file: "notdfus16wuar2o9h1tyzvbp.webp" },
      { alt: ":2542:", file: "vgi743wzp6654v4q1fmlgq0v.webp" },
      { alt: ":3610narin:", file: "as4wz8hj5kpf2gv39wjru8bb.webp" },
      { alt: ":tissa:", file: "ce38i7r6m5qt1b2r2sxspvzp.webp" },
      { alt: ":neo_halloween:", file: "uf7qzri2j46u8mrroj7b89dk.webp" },
      { alt: ":tekketsu_McGillis:", file: "jfs4putinltl5le79h6zgo88.webp" },
      { alt: ":tekketsu_UrdrHuntRing:", file: "ll75qpaipjh4el4hm9xel9in.webp" },
      { alt: ":gaelio:", file: "aozmntkisjt54ycesio3nm8s.webp" },
      { alt: ":meets_rock_1:", file: "j6oqrkdub4g8d1ma0uagdy9q.webp" },
      { alt: ":meets_rock_2:", file: "v5p7rgva3ymk8sjfyya64dbd.webp" },
      { alt: ":meets_rock_3:", file: "b4uq8p3ih3swpumfp15y2uip.webp" },
      { alt: ":meets_rock_4:", file: "a2dmds1nwwk61fyvzculg0wl.webp" },
      { alt: ":meets_rock_5:", file: "y8fqnpndoa9k9h1itb92vm83.webp" },
      { alt: ":meets_rock_6:", file: "kfv1ygte1q0yw037ftm7t3ok.webp" },
      { alt: ":stronger:", file: "sawmbfn89tjaeh2r2629pwqj.webp" },
      { alt: ":Kamille_Re:", file: "ipiusm9aln9690m73vazwgfl.webp" },
      { alt: ":goodjob:", file: "s7le5r0tpwyc46h9vv8eulg9.webp" },
      { alt: ":gudako:", file: "ucn5kj91x8mioj7vbyidyrfn.webp" },
      { alt: ":hayasugiru:", file: "opr1ml80ez7xkbv2nen0k1ps.webp" },
      { alt: ":hee:", file: "eqkaumx3kcqar23849wpyfnd.webp" },
      { alt: ":hentai:", file: "ym59bcoi6ib9p9iz0a5co3t5.webp" },
      { alt: ":hentaida:", file: "xfjw66pts3ofqpphem3hcwsp.webp" },
      { alt: ":HIKARI:", file: "hv9b4n6dj0h7tljeqwlo2258.webp" },
      { alt: ":Hisoka:", file: "zv77r1dakt5hgdahn78weo0n.webp" },
      { alt: ":hissi:", file: "u9okcpks5558jq92n4gld1z7.webp" },
      { alt: ":hitonokokoro:", file: "jmfggep6kxcynrlzyphxfou3.webp" },
      { alt: ":hyadoradora:", file: "p8pw9z3cwb2pfkaol47m0sxn.webp" },
      { alt: ":hyojikakakuyorihangaku:", file: "qtani3q75pfv8z03dbw2d4jl.webp" },
      { alt: ":hysgori:", file: "yder10io5e8edylshm4mo5yr.webp" },
      { alt: ":ikan:", file: "y29uomohb0byzvj0e1oxfzpb.webp" },
      { alt: ":infight:", file: "lsmu1wrw2uqcd9kxi5jzn45x.webp" },
      { alt: ":shotacon:", file: "gpf9kt12g4ys9yn3b6kdcqsf.webp" },
      { alt: ":joshiaki:", file: "vrwmawagf8svct0td0tc5naf.webp" },
      { alt: ":Judy:", file: "o2tth7hkoxb0huwmvb5mposh.webp" },
      { alt: ":kasumi:", file: "lryxnmzt0zxwv62vkn6bmx53.webp" },
      { alt: ":1st:", file: "hdfid5ial1zqlpxlk64res4e.webp" },
      { alt: ":2nd:", file: "arb64mvhdpgrt7rq23illh1h.webp" },
      { alt: ":owattyama_fall:", file: "bpfdl4flcvq3pu0cptni8gmo.webp" },
      { alt: ":kataitasugidaro:", file: "k3ci1s75if5qhodzeau630kw.webp" },
      { alt: ":edashi:", file: "oiso4rk6tqbtks62pjewm2el.webp" },
      { alt: ":koito:", file: "w07qqtgqq8ougtwnb09sjzf2.webp" },
      { alt: ":amuro:", file: "iqz53gorrpjnyj6snxumap4r.webp" },
      { alt: ":LAOmucchi:", file: "c6kmkysi15k7ty07a2bb1j3b.webp" },
      { alt: ":luffy:", file: "o61iqmf71r59oltq4u48bqrp.webp" },
      { alt: ":Madowasareruna:", file: "bo7cjreet1l44h33ra11jnxp.webp" },
      { alt: ":makeoshimi:", file: "no02ivpxas6h6nbdkc6czmn3.webp" },
      { alt: ":mama:", file: "z8jaw2wbm6ksl4k7fdauckyt.webp" },
      { alt: ":matahennnano:", file: "jkyng1dn8lkz9nji5guagffc.webp" },
      { alt: ":matyu:", file: "etfi91owdn8h4mner8rlkhem.webp" },
      { alt: ":miho:", file: "qebeoxzkko20kb2bljs97xde.webp" },
      { alt: ":mijikeeyume:", file: "os7h7k1e3hjmmx8giankt5cr.webp" },
      { alt: ":KorehaNani2:", file: "c5u9ld2t0w10dyqoob6otf1s.webp" },
      { alt: ":moeko:", file: "pz0f64kb319wfwspanefboe6.webp" },
      { alt: ":korosusika:", file: "w43fpx6egjidnb91ko1b04mr.webp" },
      { alt: ":moutoku:", file: "w4sdnfhj6zx9gbuwod9z8sjn.webp" },
      { alt: ":myakumyaku:", file: "y63ni367uqoxkplt9ah4im36.webp" },
      { alt: ":naityatta2:", file: "cvump0j7mdup5qeqj8n18ll9.webp" },
      { alt: ":nan:", file: "rnd2363grwspiy3ecehyoqn7.webp" },
      { alt: ":aruyo:", file: "gfug5l0m1en6e14m8x364si3.webp" },
      { alt: ":aruyo2:", file: "vf6s8lc5lyqgf65l1zfcx9ah.webp" },
      { alt: ":nanoda:", file: "sqso8qvrevgwqi6wysstimmc.webp" },
      { alt: ":bikkuri:", file: "gsn41puerflnot0uisth1ebk.webp" },
      { alt: ":nero:", file: "mswekzzby6wzvexliu1er83o.webp" },
      { alt: ":Asuna:", file: "apfbi9ou0xi43v56sjseegds.webp" },
      { alt: ":nu:", file: "ytpzxe52rsi7fwaem1ete8r8.webp" },
      { alt: ":nyaoha:", file: "gubwi4s3sad1hwc07axg07x3.webp" },
      { alt: ":oioioi:", file: "a41mrhb4b95wsswg95ashiz4.webp" },
      { alt: ":omega:", file: "whz4osp6ijkd3hcdwrzze2x1.webp" },
      { alt: ":oosanshouuo:", file: "nmmceooxlhevc5tthcx986mh.webp" },
      { alt: ":orukora:", file: "gl4qg0s5w181tl9sv7qym2ig.webp" },
      { alt: ":udegumi:", file: "oppz6ox70gdcwmxxxis8hoob.webp" },
      { alt: ":OYASUMI:", file: "ud7s0vwgkvz1148xvnp2kana.webp" },
      { alt: ":peropero:", file: "ft4agmi64gza8dqkydhj3114.webp" },
      { alt: ":peroro:", file: "he14r3xuriiqw9nwo9x6o3zh.webp" },
      { alt: ":chang:", file: "yhae36a15ze9mlg93k1sy8kf.webp" },
      { alt: ":isan:", file: "zriuewink8261n3z8yexgz9j.webp" },
      { alt: ":Sensoudesuwa:", file: "h837cyiy6wirgc65shahim9w.webp" },
      { alt: ":shanoseisin:", file: "smqj04g36onmtaag3tngo84w.webp" },
      { alt: ":nikuiyo:", file: "qlgpdy2ibq36jqoct3biv2q5.webp" },
      { alt: ":ogoruna:", file: "qcggjgmpnr9l0m1bh2e3lvc7.webp" },
      { alt: ":soredayo:", file: "q2rced7gzpdhen6e1f7xjjw1.webp" },
      { alt: ":space_cat:", file: "s1hbet9b4jkvweb1lgeq47kw.webp" },
      { alt: ":Dark_Ultraman:", file: "dvuq1em60jh7ebahlkpfw9s1.webp" },
      { alt: ":sugoi:", file: "rtowuqx5douai6xddr7lxx5w.webp" },
      { alt: ":sukeroku:", file: "u9wdp2upfddzuqvdig9l9nts.webp" },
      { alt: ":sukidaze:", file: "gwobjr5g6tw7oibedzv70da7.webp" },
      { alt: ":oide:", file: "xceq9pqf1x4yiq6clzopfors.webp" },
      { alt: ":tanuki:", file: "pwzv1edwtad25vg8lqd6fgnd.webp" },
      { alt: ":tinko:", file: "udro7v5e1klkgexejzo3h8qv.webp" },
      { alt: ":tinn:", file: "it1cp364ifpbc5o97aukazi8.webp" },
      { alt: ":toshiaki:", file: "nb16tqx2i5qi9090faq6hdpq.webp" },
      { alt: ":tough:", file: "gzgnc2mk1u5htucpi52n3oqd.webp" },
      { alt: ":kukuku:", file: "hpb3ygkmdnd0ewuvji32urhh.webp" },
      { alt: ":tsugikara:", file: "btbd0jfg8krhm89ht2jnbr2t.webp" },
      { alt: ":TUXA:", file: "otblzs459lyh1a7jusw527tn.webp" },
      { alt: ":ff5hennnanoda:", file: "v4pndg44qm6su24308uaqw3y.webp" },
      { alt: ":aozame_spe:", file: "asfr5zzkzd2a98z3ho3lz9ok.webp" },
      { alt: ":doto:", file: "wya8n021fq5w3adkqv174p8f.webp" },
      { alt: ":only_musume:", file: "jja8zadgoaf4b9cdktc8me7p.webp" },
      { alt: ":windy_gomen_nasai_nanoda:", file: "d2efw6euwowyuoqzwcx4b1pa.webp" },
      { alt: ":umu:", file: "lapsjrsvijbbp1e74k32dfpb.webp" },
      { alt: ":usero:", file: "gomq7zn8jhs7itu6xeuzdqh5.webp" },
      { alt: ":usoda:", file: "vbbh3gbb9ykkznjrapai8p2c.webp" },
      { alt: ":utsukushiiwa:", file: "hdqazxijkatzmlnmm5v0xzmf.webp" },
      { alt: ":uwarincyanda:", file: "qi52pmdnxi4sqzuwc9vols3w.webp" },
      { alt: ":vsdarkrai:", file: "q4hxnzhjnec5outele8ubypn.webp" },
      { alt: ":wagunasu:", file: "f0qi0hf9a4akbb3ajnuetuwq.webp" },
      { alt: ":Kiwotuke_shinjauyo:", file: "qzhlt0ks8dde11hfp93z34am.webp" },
      { alt: ":wappi:", file: "ft4bj721inaao4r4bfh8iyak.webp" },
      { alt: ":waruibunmei:", file: "kpable5ml9mwbqc99a4kh4z8.webp" },
      { alt: ":bouryoku:", file: "bkfkdcuch3mlx28jwi30g1kd.webp" },
      { alt: ":yami:", file: "la90fiv5ld5pyyf6a4eh3yjz.webp" },
      { alt: ":yattaaa:", file: "qdpq7z3d6h5pniiuypm93rjd.webp" },
      { alt: ":hatanokokoro:", file: "n1k1hxy9agpsskkmrx0ibl95.webp" },
      { alt: ":yuetsu:", file: "zsz95xy9nrv62g89j1p4jy17.webp" },
      { alt: ":taimanin_sositu:", file: "vhqgfzp97mrqcq5eywgk2vl2.webp" },
      { alt: ":yuri:", file: "lwg3sc95788jlfklejva9s5t.webp" },
      { alt: ":zeero:", file: "sfbvu3v3td7th7q3ts8ee53l.webp" },
      { alt: ":sushinarusan:", file: "w6ob979g404osx738o9yxs74.webp" },
    ];

    function getAlt(img) {
      // ファイル名で検索する
      const imgFilename = getFileName(img.src);
      const found = icons.find(icon => icon.file === imgFilename);
      return found ? found.alt : '<:undefined:>';
    }

    return { getAlt };
  })();

  // ---- ツールチップウィンドウ ----

  const infoWindow = (() => {
    let el = null;

    function onMouseMove(e) {
      if (!el) return;
      el.style.left = `${e.pageX + 10}px`;
      el.style.top = `${e.pageY + 10}px`;
    }

    function show(img) {
      const alt = img.alt === '<:undefined:>'
        ? emojiCache.getAlt(img)
        : img.alt;

      el = document.createElement('div');
      Object.assign(el.style, {
        position: 'absolute',
        backgroundColor: 'black',
        color: 'white',
        border: '1px solid black',
        padding: '10px',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
      });

      const icon = document.createElement('img');
      icon.src = img.src;
      Object.assign(icon.style, { width: '100px', height: '100px' });

      const name = document.createElement('div');
      name.textContent = alt;

      el.appendChild(icon);
      el.appendChild(name);
      document.body.appendChild(el);
      document.addEventListener('mousemove', onMouseMove);
    }

    function hide() {
      if (!el) return;
      document.body.removeChild(el);
      document.removeEventListener('mousemove', onMouseMove);
      el = null;
    }

    return { show, hide };
  })();

  // ---- 絵文字画像拡張 ----

  const emojiImage = (() => {
    const processed = new WeakSet();

    function extend(img) {
      if (processed.has(img)) return;
      processed.add(img);

      img.addEventListener('mouseenter', () => infoWindow.show(img));
      img.addEventListener('mouseleave', () => infoWindow.hide());
    }

    function scan() {
      document.querySelectorAll('img.custom-emoji-image').forEach(extend);
    }

    return { scan };
  })();

  // ---- MutationObserver ----

  const domObserver = (() => {
    let observer = null;

    function start(target) {
      if (observer) return;
      const throttledScan = throttle(emojiImage.scan, 500);
      observer = new MutationObserver(throttledScan);
      observer.observe(target, { childList: true, subtree: true });
    }

    return { start };
  })();

  // ---- 初期化 ----

  function init() {
    const main = document.querySelector('main');
    if (!main) {
      setTimeout(init, 500);
      return;
    }

    emojiImage.scan();
    domObserver.start(main);
  }

  setTimeout(init, 400);
})();
