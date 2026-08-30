// ==UserScript==
// @name         めぶきちゃんの絵文字ツールチップを拡張
// @namespace    https://raw.githubusercontent.com/sissis-source/
// @homepage     https://github.com/sissis-source/mebuki-emoji-userscript
// @version      2026.08.31.01
// @description  めぶきちゃんの絵文字ツールチップを拡張
// @author       sissis
// @match        https://mebuki.moe/app*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mebuki.moe
// @downloadURL  https://raw.githubusercontent.com/sissis-source/mebuki-emoji-userscript/refs/heads/main/mebuki-emoji.user.js
// @updateURL    https://raw.githubusercontent.com/sissis-source/mebuki-emoji-userscript/refs/heads/main/mebuki-emoji.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    emojiSelector: 'img.custom-emoji-image',
    initDelayMs: 400,
    initRetryDelayMs: 500,
    mainSelector: 'main',
    scanIntervalMs: 500,
    tooltipSelector: '#emoji-tooltip',
  };

  const _changelog = {
    '2026.08.31.01': [
      'めぶきちゃん標準の絵文字ツールチップに対応',
    ],
  };

  const UNKNOWN_ALT = ':undefined:';
  const UNKNOWN_EMOJI = '<:undefined:>';

  // ---- ユーティリティ ----

  function throttle(fn, interval) {
    let lastTime = 0;
    let timerId = null;
    let lastArgs = null;

    function invoke() {
      lastTime = Date.now();
      timerId = null;
      fn(...lastArgs);
      lastArgs = null;
    }

    return (...args) => {
      lastArgs = args;
      const now = Date.now();
      const remaining = interval - (now - lastTime);

      if (remaining <= 0) {
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
        invoke();
        return;
      }

      if (!timerId) {
        timerId = setTimeout(invoke, remaining);
      }
    };
  }

  function getFileName(url) {
    try {
      return new URL(url, location.href).pathname.split('/').pop();
    } catch (_) {
      return url.split('/').pop().split('?')[0];
    }
  }

  // ---- めぶき絵文字 ----

  const mebukiEmoji = (() => {
    const icons = {
      "m414ufodim5ptodzuf56uom3.webp": ":soudane:",
      "gqmaco39gqb9im9h5pik0hk3.webp": ":otukare:",
      "pxme6iszerel80avucugzovf.webp": ":odaijini:",
      "f9mq92j46cpi2jxbggi4ou9q.webp": ":sorena:",
      "c62r063vzj7z0lo13cuprsha.webp": ":soukana:",
      "f007z27uqv7aa1of5773fbad.webp": ":soukamo:",
      "bngca7qz5m1emqyqm4zded2a.webp": ":souwayo:",
      "vj5123eonbslqr0l8qavcvd4.webp": ":sonnani:",
      "i90863rvwwhfe8ks2z14chjo.webp": ":sondake:",
      "pitwte9pta5r5ykyzaww04fl.webp": ":kawaii:",
      "zb63hvappgonehpkt5wjtoaa.webp": ":H_da:",
      "qcjdi0jyiggj52ksmdapuogm.webp": ":uodekka_boost:",
      "ysvn48n3napx1ybeqra5iyrv.webp": ":hinnyuu_kansya:",
      "u401v8zub9tff7hojqegzfkr.webp": ":dekapai_kansya:",
      "rx5tugosl24q0xfvpl574y4m.webp": ":dousite:",
      "igqs6cnl52o8oopt8ie4h8lt.webp": ":sirason:",
      "h7c28nvalkvgnjzotvxugyza.webp": ":iiyone:",
      "igkowcr2p6oq2uvq5ng2ts5k.webp": ":ii:",
      "z3fbn94qhb0imc03016msav0.webp": ":naruhodo:",
      "is7xydg7v7e6o7q1nwatho6q.webp": ":wakaru:",
      "k7t4rtq0ot7tmvsk3ehbp3fc.webp": ":sorehasou:",
      "bksvxrcv0ay8t5lqvuyys49t.webp": ":donmai:",
      "itqe8carkq6uqx36an453hwl.webp": ":ganbare:",
      "eqero9j8b5kx4j2qzhgwb8ha.webp": ":sikatanasi:",
      "h3t98ozk4kssj2ove0h464dz.webp": ":uwakitsu:",
      "utuujqfq3pbbzi3nzt3pfqhe.webp": ":yokunai:",
      "w7yn863n8qgwd19xgevqoj8z.webp": ":sorehadame:",
      "f3brrbb2qq3j5f6lklyxim5n.webp": ":damare_kozou:",
      "fizto759uxtnp0vwxckt0ulu.webp": ":erai:",
      "cxxwyn4yqxg4ij2yz5a2wgzy.webp": ":kansya:",
      "tz2lbxtzy5k5qnkd9ag3pkxh.webp": ":sutekidane:",
      "xdl30ftxisodkyhnwxsuttzt.webp": ":tekidane:",
      "v4m03n19e0qecwze0ar82uup.webp": ":sugoiwa:",
      "l1copoc6ets4ouxwb2jls07o.webp": ":damedatta:",
      "vo9hoysekvjrmdnfh3h3okyf.webp": ":kodokuno_ikenai:",
      "mhjf94f0m9gmuwde345byof3.webp": ":chimpodawa:",
      "m0nb37uimoegootfggs02sc5.webp": ":manko_dawa:",
      "nrg58g066t4jkgtcy5rkjbxj.webp": ":tashi_crab:",
      "cyuej61eww08icuny9xai9af.webp": ":tashikani_onimai:",
      "gkcphu9jhffesstv97j3symt.webp": ":kashikoi:",
      "qlv28d127hvyl2l0lor42yxx.webp": ":sayou:",
      "untqqiwnb1zqr3qlownb2h9n.webp": ":usoda_ne:",
      "hbna30g8f7fzr06rv3dff1w8.webp": ":waha:",
      "koz62dxbfgxr8331apd3of6a.webp": ":taiari:",
      "wgvkoxoiuf5otbj367nekfp6.webp": ":death:",
      "psz3famxa1cc28uijdvh7ljr.webp": ":nen:",
      "zwwamwipnkkfacyvpebd3g3c.webp": ":kan:",
      "r37jocbfttdejubaakmq9tgn.webp": ":zaaako:",
      "itt7lf9vq9wk5a4t1nza7byf.webp": ":deb:",
      "pb8hq1jc8n2o6u9ykmjr0v3w.webp": ":yoshi:",
      "eoiejs31sm9v3p0encb2waen.webp": ":daizyoubudesu:",
      "sx6slnetrrvwov82aatv24ty.webp": ":iwankottyaNIGHT:",
      "fad9e4cxmbgb5b3g45uegha3.webp": ":doushite:",
      "kd6x5h7tb1b8norpmktlg5t4.webp": ":nanimowakaranai_boost:",
      "qnau54tkc1rsrbxum80qg5n8.webp": ":hayarukamo:",
      "izj6r9hunwqycfi9b3dmaqtn.webp": ":mujiina:",
      "pl7xysuussgfygcnrge06m71.webp": ":homo:",
      "y7ag3ypzj571be0cv4znswm3.webp": ":dora_jitome:",
      "fst2zmxzky5f4pqm5rnajzop.webp": ":konohito_homodesu:",
      "z2jdce4ipai3cb8ln0c15ssi.webp": ":Karyl:",
      "fxeuiqdc5tc78m9jwtg1trdq.webp": ":Karyl_kissyo:",
      "zqrw5tjjymyfzrc7bt3zotwt.webp": ":Karyl_Yabaiwayo_Hennyusei:",
      "am7h0s2q0jocyhlypgo99iqj.webp": ":yappa_tureewa:",
      "u645c1og5nwc3drqnmz2wep9.webp": ":kowaa:",
      "ia6dntqsa5cvji7vyeyziofs.webp": ":ko_kowai:",
      "ef5avp2ogpx4argv8h0l3snj.webp": ":kowa:",
      "jf1ay8r8oguiafnhpjiaafa3.webp": ":sore_mazi_yabai:",
      "uen73fr5ehrwx2sp7e1ru8zr.webp": ":kawaisou:",
      "lknbampwt5gch7r8o823zf9f.webp": ":kakkoii:",
      "yiko5fmbuyshzvq3cg0t3cm6.webp": ":yokuneeyo:",
      "mmf9qhgn64apdnarszfx744t.webp": ":danaon_konwaku:",
      "loh9ebtlk5kfk4voa1hqepvc.webp": ":kagen_siro_baka:",
      "ynd0sr4r840u4fnwcdehymym.webp": ":nannanda:",
      "d0mqtau7hl671holvbcj4c8q.webp": ":haa:",
      "aoinopq6z9rpce69c12pm4fd.webp": ":wakaru2:",
      "s2aqgq6s8fw9lp5fpj2c0scy.webp": ":sukoshinaku:",
      "svapvvclp05m28gmla10seiq.webp": ":jyusei:",
      "kjpz4oc0lyrdn4k53hvm97kl.webp": ":nanika_mondai_demo:",
      "z0hygwgvccc3ge121c8dskqa.webp": ":totemo_turai:",
      "k4dnofpy7uv06bzjhcct7nnf.webp": ":yadaaaa_addon:",
      "bl073bs93q8dfm6h5ryba1m4.webp": ":dante_h_boost:",
      "vp0b966eainyjxn15bizulpb.webp": ":kireorga_boost:",
      "plxu6tc85o7yi317hbtproco.webp": ":anome_boost:",
      "uinoypixz471fzkubruht8ep.webp": ":Kaede_huhutte:",
      "n5v5phrvyygnedwdq05dut96.webp": ":yamada_boost:",
      "o2sn4nd3w6lk7ixt09hgn26k.webp": ":ichikawa_boost:",
      "jhjxx8idfg75kyq7ez4hoii0.webp": ":ebicurry_azurlane_boost:",
      "xdowhrmolgze2jqji5bf1xgs.webp": ":coffee_umasi_boost:",
      "yrqot6zscwa1kdxzldn59py7.webp": ":jcb_boost:",
      "ujbvodn4us6mwhf0ifwhnvux.webp": ":JCBchang_maru:",
      "f089pcoxk3se5vdlfajuyuv4.webp": ":JCBchang_batsu:",
      "nypqni0elb53pd76033p10ug.webp": ":jcb_404_crying:",
      "p6qtdhmsbfi29agaj964i9n1.webp": ":jcb_dekiraa:",
      "zyj60spmp4zd5nyo83jmv1mp.webp": ":kakutei_boost:",
      "n1o282rk4mqc8a3gtsjcqs89.webp": ":umasou_boost:",
      "byfehsq1a41i8wvj9vrk2ft2.webp": ":onakasuita:",
      "z0dp2g9hgbddn2c97xlgd9bq.webp": ":Washinoja_PowerChan_Test:",
      "xwwrcj14hxuc1rfyuis61frm.webp": ":big_ban_burn_bakedmochocho:",
      "jdwcfu58db7tgfkclwkrpf75.webp": ":akane3:",
      "ltnrmu2oy4fr5vt8btd2q7iv.webp": ":gaoru:",
      "i94eyecsp5afr9n2on0sid6f.webp": ":Amamiya:",
      "t0xhddakm9zujawyj6d7t7kl.webp": ":anchinsama:",
      "w8y8gexam66ul2w6kxf67zk7.webp": ":anome:",
      "hoqhmfuqrzk19erjom4dsjfp.webp": ":aridesune:",
      "zxa03y898iqjjw5q6hyi0mlk.webp": ":arigatou:",
      "nocd4i3x42xzdbn1l4mbnm3q.webp": ":ARONA:",
      "jsv947c6qiihzf3vyskvpqm8.webp": ":aruchan:",
      "dezv7jvz2jaapu6vmkpa39as.webp": ":asuranmakka:",
      "ukjs25rs06usa3qhlzgzwj34.webp": ":Dante:",
      "ur000j5xvwfewf40kjsia8h3.webp": ":atarimae:",
      "qb5tv170rzz7dgsttanw8e71.webp": ":frieren:",
      "x6l6toww0gabv0ougfp0vh9s.webp": ":balom:",
      "kfqy5u6r21s8ppqnj2v8jkt5.webp": ":chadan:",
      "qo4pyokdczc59hud05zvvte3.webp": ":soujanai:",
      "c6c5erl60w1jwuoe3bupi7ig.webp": ":Columbus:",
      "jnxwnacqdbzvyokp9joultsb.webp": ":vader_inv:",
      "bfmhv871m2dfzxeqow7lkua9.webp": ":kimo:",
      "jz8ihevf8pp8vahm4bflkbjf.webp": ":Fenrys:",
      "rekivntvcodymxsptdoq2spp.webp": ":dareda:",
      "kip5wxf6siernsei9leo0sjs.webp": ":kyoufu:",
      "q30391d8t602gtccsujnhpk7.webp": ":demaecan:",
      "dg1iuu4ut6de9ghu7c0k49qd.webp": ":Denjirou:",
      "bjbtveeq88t6gtks4nin9i0e.webp": ":pikachu:",
      "r5se07nd7r7bzbzzs9etcxm8.webp": ":doro:",
      "ufn9k3cl0vh0lob4q0v6crdd.webp": ":0810:",
      "u01og0d5qzk7l4e0y0tvyu03.webp": ":naniwo:",
      "lqrgp2sbt7kjql7it60wzfel.webp": ":emmy:",
      "notdfus16wuar2o9h1tyzvbp.webp": ":254:",
      "vgi743wzp6654v4q1fmlgq0v.webp": ":2542:",
      "as4wz8hj5kpf2gv39wjru8bb.webp": ":3610narin:",
      "ce38i7r6m5qt1b2r2sxspvzp.webp": ":tissa:",
      "uf7qzri2j46u8mrroj7b89dk.webp": ":neo_halloween:",
      "jfs4putinltl5le79h6zgo88.webp": ":tekketsu_McGillis:",
      "ll75qpaipjh4el4hm9xel9in.webp": ":tekketsu_UrdrHuntRing:",
      "aozmntkisjt54ycesio3nm8s.webp": ":gaelio:",
      "j6oqrkdub4g8d1ma0uagdy9q.webp": ":meets_rock_1:",
      "v5p7rgva3ymk8sjfyya64dbd.webp": ":meets_rock_2:",
      "b4uq8p3ih3swpumfp15y2uip.webp": ":meets_rock_3:",
      "a2dmds1nwwk61fyvzculg0wl.webp": ":meets_rock_4:",
      "y8fqnpndoa9k9h1itb92vm83.webp": ":meets_rock_5:",
      "kfv1ygte1q0yw037ftm7t3ok.webp": ":meets_rock_6:",
      "sawmbfn89tjaeh2r2629pwqj.webp": ":stronger:",
      "ipiusm9aln9690m73vazwgfl.webp": ":Kamille_Re:",
      "s7le5r0tpwyc46h9vv8eulg9.webp": ":goodjob:",
      "ucn5kj91x8mioj7vbyidyrfn.webp": ":gudako:",
      "opr1ml80ez7xkbv2nen0k1ps.webp": ":hayasugiru:",
      "eqkaumx3kcqar23849wpyfnd.webp": ":hee:",
      "ym59bcoi6ib9p9iz0a5co3t5.webp": ":hentai:",
      "xfjw66pts3ofqpphem3hcwsp.webp": ":hentaida:",
      "hv9b4n6dj0h7tljeqwlo2258.webp": ":HIKARI:",
      "zv77r1dakt5hgdahn78weo0n.webp": ":Hisoka:",
      "u9okcpks5558jq92n4gld1z7.webp": ":hissi:",
      "jmfggep6kxcynrlzyphxfou3.webp": ":hitonokokoro:",
      "p8pw9z3cwb2pfkaol47m0sxn.webp": ":hyadoradora:",
      "qtani3q75pfv8z03dbw2d4jl.webp": ":hyojikakakuyorihangaku:",
      "yder10io5e8edylshm4mo5yr.webp": ":hysgori:",
      "y29uomohb0byzvj0e1oxfzpb.webp": ":ikan:",
      "lsmu1wrw2uqcd9kxi5jzn45x.webp": ":infight:",
      "gpf9kt12g4ys9yn3b6kdcqsf.webp": ":shotacon:",
      "vrwmawagf8svct0td0tc5naf.webp": ":joshiaki:",
      "o2tth7hkoxb0huwmvb5mposh.webp": ":Judy:",
      "lryxnmzt0zxwv62vkn6bmx53.webp": ":kasumi:",
      "hdfid5ial1zqlpxlk64res4e.webp": ":1st:",
      "arb64mvhdpgrt7rq23illh1h.webp": ":2nd:",
      "bpfdl4flcvq3pu0cptni8gmo.webp": ":owattyama_fall:",
      "k3ci1s75if5qhodzeau630kw.webp": ":kataitasugidaro:",
      "oiso4rk6tqbtks62pjewm2el.webp": ":edashi:",
      "w07qqtgqq8ougtwnb09sjzf2.webp": ":koito:",
      "iqz53gorrpjnyj6snxumap4r.webp": ":amuro:",
      "c6kmkysi15k7ty07a2bb1j3b.webp": ":LAOmucchi:",
      "o61iqmf71r59oltq4u48bqrp.webp": ":luffy:",
      "bo7cjreet1l44h33ra11jnxp.webp": ":Madowasareruna:",
      "no02ivpxas6h6nbdkc6czmn3.webp": ":makeoshimi:",
      "z8jaw2wbm6ksl4k7fdauckyt.webp": ":mama:",
      "jkyng1dn8lkz9nji5guagffc.webp": ":matahennnano:",
      "etfi91owdn8h4mner8rlkhem.webp": ":matyu:",
      "qebeoxzkko20kb2bljs97xde.webp": ":miho:",
      "os7h7k1e3hjmmx8giankt5cr.webp": ":mijikeeyume:",
      "c5u9ld2t0w10dyqoob6otf1s.webp": ":KorehaNani2:",
      "pz0f64kb319wfwspanefboe6.webp": ":moeko:",
      "w43fpx6egjidnb91ko1b04mr.webp": ":korosusika:",
      "w4sdnfhj6zx9gbuwod9z8sjn.webp": ":moutoku:",
      "y63ni367uqoxkplt9ah4im36.webp": ":myakumyaku:",
      "cvump0j7mdup5qeqj8n18ll9.webp": ":naityatta2:",
      "rnd2363grwspiy3ecehyoqn7.webp": ":nan:",
      "gfug5l0m1en6e14m8x364si3.webp": ":aruyo:",
      "vf6s8lc5lyqgf65l1zfcx9ah.webp": ":aruyo2:",
      "sqso8qvrevgwqi6wysstimmc.webp": ":nanoda:",
      "gsn41puerflnot0uisth1ebk.webp": ":bikkuri:",
      "mswekzzby6wzvexliu1er83o.webp": ":nero:",
      "apfbi9ou0xi43v56sjseegds.webp": ":Asuna:",
      "ytpzxe52rsi7fwaem1ete8r8.webp": ":nu:",
      "gubwi4s3sad1hwc07axg07x3.webp": ":nyaoha:",
      "a41mrhb4b95wsswg95ashiz4.webp": ":oioioi:",
      "whz4osp6ijkd3hcdwrzze2x1.webp": ":omega:",
      "nmmceooxlhevc5tthcx986mh.webp": ":oosanshouuo:",
      "gl4qg0s5w181tl9sv7qym2ig.webp": ":orukora:",
      "oppz6ox70gdcwmxxxis8hoob.webp": ":udegumi:",
      "ud7s0vwgkvz1148xvnp2kana.webp": ":OYASUMI:",
      "ft4agmi64gza8dqkydhj3114.webp": ":peropero:",
      "he14r3xuriiqw9nwo9x6o3zh.webp": ":peroro:",
      "yhae36a15ze9mlg93k1sy8kf.webp": ":chang:",
      "zriuewink8261n3z8yexgz9j.webp": ":isan:",
      "h837cyiy6wirgc65shahim9w.webp": ":Sensoudesuwa:",
      "smqj04g36onmtaag3tngo84w.webp": ":shanoseisin:",
      "qlgpdy2ibq36jqoct3biv2q5.webp": ":nikuiyo:",
      "qcggjgmpnr9l0m1bh2e3lvc7.webp": ":ogoruna:",
      "q2rced7gzpdhen6e1f7xjjw1.webp": ":soredayo:",
      "s1hbet9b4jkvweb1lgeq47kw.webp": ":space_cat:",
      "dvuq1em60jh7ebahlkpfw9s1.webp": ":Dark_Ultraman:",
      "rtowuqx5douai6xddr7lxx5w.webp": ":sugoi:",
      "u9wdp2upfddzuqvdig9l9nts.webp": ":sukeroku:",
      "gwobjr5g6tw7oibedzv70da7.webp": ":sukidaze:",
      "xceq9pqf1x4yiq6clzopfors.webp": ":oide:",
      "pwzv1edwtad25vg8lqd6fgnd.webp": ":tanuki:",
      "udro7v5e1klkgexejzo3h8qv.webp": ":tinko:",
      "it1cp364ifpbc5o97aukazi8.webp": ":tinn:",
      "nb16tqx2i5qi9090faq6hdpq.webp": ":toshiaki:",
      "gzgnc2mk1u5htucpi52n3oqd.webp": ":tough:",
      "hpb3ygkmdnd0ewuvji32urhh.webp": ":kukuku:",
      "btbd0jfg8krhm89ht2jnbr2t.webp": ":tsugikara:",
      "otblzs459lyh1a7jusw527tn.webp": ":TUXA:",
      "v4pndg44qm6su24308uaqw3y.webp": ":ff5hennnanoda:",
      "asfr5zzkzd2a98z3ho3lz9ok.webp": ":aozame_spe:",
      "wya8n021fq5w3adkqv174p8f.webp": ":doto:",
      "jja8zadgoaf4b9cdktc8me7p.webp": ":only_musume:",
      "d2efw6euwowyuoqzwcx4b1pa.webp": ":windy_gomen_nasai_nanoda:",
      "lapsjrsvijbbp1e74k32dfpb.webp": ":umu:",
      "gomq7zn8jhs7itu6xeuzdqh5.webp": ":usero:",
      "vbbh3gbb9ykkznjrapai8p2c.webp": ":usoda:",
      "hdqazxijkatzmlnmm5v0xzmf.webp": ":utsukushiiwa:",
      "qi52pmdnxi4sqzuwc9vols3w.webp": ":uwarincyanda:",
      "q4hxnzhjnec5outele8ubypn.webp": ":vsdarkrai:",
      "f0qi0hf9a4akbb3ajnuetuwq.webp": ":wagunasu:",
      "qzhlt0ks8dde11hfp93z34am.webp": ":Kiwotuke_shinjauyo:",
      "ft4bj721inaao4r4bfh8iyak.webp": ":wappi:",
      "kpable5ml9mwbqc99a4kh4z8.webp": ":waruibunmei:",
      "bkfkdcuch3mlx28jwi30g1kd.webp": ":bouryoku:",
      "la90fiv5ld5pyyf6a4eh3yjz.webp": ":yami:",
      "qdpq7z3d6h5pniiuypm93rjd.webp": ":yattaaa:",
      "n1k1hxy9agpsskkmrx0ibl95.webp": ":hatanokokoro:",
      "zsz95xy9nrv62g89j1p4jy17.webp": ":yuetsu:",
      "vhqgfzp97mrqcq5eywgk2vl2.webp": ":taimanin_sositu:",
      "lwg3sc95788jlfklejva9s5t.webp": ":yuri:",
      "sfbvu3v3td7th7q3ts8ee53l.webp": ":zeero:",
      "w6ob979g404osx738o9yxs74.webp": ":sushinarusan:",
    };

    function normalizeEmojiText(value) {
      if (typeof value !== 'string') {
        return UNKNOWN_EMOJI;
      }

      const trimmed = value.trim();
      const inner = trimmed.replace(/^<|>$/g, '').trim();

      if (!inner) {
        return UNKNOWN_EMOJI;
      }

      if (inner.startsWith(':') && inner.endsWith(':')) {
        return `<${inner}>`;
      }

      return `<:${inner}:>`;
    }

    function getEmojiTag(img) {
      const alt = img?.alt ?? '';

      if (alt.includes(UNKNOWN_ALT)) {
        const fileName = getFileName(img.src);
        const iconName = icons[fileName];
        return normalizeEmojiText(iconName || alt || UNKNOWN_ALT);
      }

      if (alt && !alt.includes(':')) {
        return alt;
      }

      return normalizeEmojiText(alt);
    }

    async function copyToClipboard(img) {
      const emoji = getEmojiTag(img);

      try {
        await navigator.clipboard.writeText(emoji);
        alert(`${emoji} をクリップボードにコピーしました。`);
      } catch (err) {
        console.error('絵文字のコピーに失敗しました。', err);
        alert('絵文字のコピーに失敗しました。');
      }
    }

    return { copyToClipboard, getEmojiTag };
  })();

  // ---- サイト標準の絵文字 tooltip ----

  let lastPointer = { x: 0, y: 0 };

  const emojiTooltip = (() => {
    const copyHintAttribute = 'data-mebuki-copy-hint';
    let keydownListener = null;

    function addCopyHint(tooltip) {
      if (tooltip.hasAttribute(copyHintAttribute)) return;

      const hint = document.createElement('span');
      hint.textContent = 'Cキーでコピー';
      hint.style.fontSize = '12px';
      tooltip.appendChild(hint);
      tooltip.setAttribute(copyHintAttribute, '');
    }

    function getVisibleTooltip() {
      const tooltip = document.querySelector(CONFIG.tooltipSelector);
      if (!tooltip || tooltip.dataset.state === 'closed') return null;
      return tooltip;
    }

    function copyFromTooltip(e) {
      if (e.key.toLowerCase() !== 'c') return;

      const tooltip = getVisibleTooltip();
      if (!tooltip) return;

      const target = document.elementFromPoint(lastPointer.x, lastPointer.y);
      const img = target?.closest('img') ?? tooltip.querySelector('img');
      if (img) mebukiEmoji.copyToClipboard(img);
    }

    function attachKeydownListener() {
      if (keydownListener) return;
      keydownListener = copyFromTooltip;
      document.addEventListener('keydown', keydownListener);
    }

    function detachKeydownListener() {
      if (!keydownListener) return;
      document.removeEventListener('keydown', keydownListener);
      keydownListener = null;
    }

    function updateListenerState() {
      const isTooltipOpen = !!getVisibleTooltip();
      if (isTooltipOpen) {
        attachKeydownListener();
      } else {
        detachKeydownListener();
      }
    }

    function scan() {
      const tooltip = document.querySelector(CONFIG.tooltipSelector);
      if (tooltip) {
        addCopyHint(tooltip);
      }

      updateListenerState();
    }

    function start() {
      const observer = new MutationObserver(scan);
      observer.observe(document.body, { childList: true, subtree: true });
      scan();
    }

    return { start };
  })();

  // ---- 絵文字画像拡張 ----

  const emojiImage = (() => {
    const enhancedImg = new WeakSet();

    // 絵文字がレス内のものかどうか。
    function isInlineEmoji(img) {
      return !img.closest('button');
    }

    function attachClickCopy(img) {
      img.addEventListener('click', () => mebukiEmoji.copyToClipboard(img));
      img.style.cursor = 'pointer';
    }

    function enhance(img) {
      if (enhancedImg.has(img)) return;
      enhancedImg.add(img);

      // レス内の絵文字をボタン化する。
      if (isInlineEmoji(img)) {
        attachClickCopy(img);
      }
    }

    function scan() {
      document.querySelectorAll(CONFIG.emojiSelector).forEach(enhance);
    }

    return { scan };
  })();

  // ---- MutationObserver ----

  const domObserver = (() => {
    let observer = null;

    function start(target) {
      if (observer) return;
      const throttledScan = throttle(emojiImage.scan, CONFIG.scanIntervalMs);
      observer = new MutationObserver(throttledScan);
      observer.observe(target, { childList: true, subtree: true });
    }

    return { start };
  })();

  // ---- 初期化 ----

  function init() {
    const main = document.querySelector(CONFIG.mainSelector);
    if (!main) {
      setTimeout(init, CONFIG.initRetryDelayMs);
      return;
    }

    emojiImage.scan();
    emojiTooltip.start();
    domObserver.start(main);
    document.addEventListener('mousemove', (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
    });
  }

  setTimeout(init, CONFIG.initDelayMs);
})();
