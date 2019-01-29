---
title: 征服赛制Lineup和排阵背后的秘密
---
本文是[https://www.iyingdi.com/web/bbspost/detail/1825079](https://www.iyingdi.com/web/bbspost/detail/1825079)一文的镜像

征服赛制是炉石传说沿用已久的赛制。本文以征服 2 赛制和征服 3 赛制为例，分析了卡组阵容（lineup）和排阵对胜率的影响。并在文末提供了一个模拟程序供大家评估 lineup 和排阵的影响。

## 征服 2 赛制
假设我和对手的卡组对阵胜率如下：

|  | 对手卡组 Z | 对手卡组 W |
| ------ | ------ | ------ |
| 我的卡组 X | $a$ | $b$ |
| 我的卡组 Y | $c$ | $d$ |

如果我首发卡组 X，对手首发卡组 Z（记为 X↔Z），那么我赢下第一局的概率是 $a$，赢下第一局后只要卡组 Y 赢下卡组 Z 或卡组 W 就能获胜，概率为 $c+d-cd$；我输掉第一局的概率为 $1-a$，我的卡组 X 和卡组 Y 必须都战胜卡组 W，概率为 $bd$。因此我综合获胜的概率为

$$P(X\leftrightarrow Z)=a(c+d-cd)+(1-a)bd$$

<center>首发卡组 X 和卡组 Z 获胜概率（①式）</center>

将①式作字母替换，可得

$$P(Y\leftrightarrow W)=d(a+b-ab)+(1-d)ac$$

$$P(X\leftrightarrow W)=b(c+d-cd)+(1-b)ac$$

$$P(X\leftrightarrow Z)=c(a+b-ab)+(1-c)bd$$

<center>其它出阵顺序获胜概率</center>

化简之后可以发现，$P(X↔Z)=P(Y↔W)$，$P(X↔W)=P(Y↔Z)$，因此很容易求得纳什均衡解为首发任意卡组的概率均为 1/2。因此得出结论：

<span style="color: #c24f4a">征服2的最优排阵策略是等概率随机排阵。</span>

~~（会有人比赛带硬币吗）~~

应用这个策略后，征服 2 赛制总的获胜概率为

$$2ac+2bd+ad+bc-abc-abd-acd-bcd\over 2$$

<center>征服 2 赛制获胜概率（②式）</center>

下面举一个实例来分析②式的意义。假设我带了两套风格不同且比较极端的卡组 X 和 Y，而对手的某套卡组 Z 被我的卡组 Y 克制，但我的卡组 X 被对手的卡组 Z 克制，而对手的另一套卡组是一套平庸的，强度也不是特别高的卡组 W，对阵胜率假设如下（单位：%）：

|  | 对手卡组 Z | 对手卡组 W |
| ------ | ------ | ------ |
| 我的卡组 X | 30 | 52 |
| 我的卡组 Y | 70 | 52 |

看上去对手卡组 Z 打我的两套卡组综合看上去是五五开，我的两套卡组打对手卡组 W 都是小优，直觉上看我应该有优势才对？然而将数据代入②式，计算得出我的胜率是 49.6%，小于 50%，我竟然是劣势的！原因在于虽然 (a + c) / 2 仍然维持了 50%，但②式中占比较大的 2ac 一项却变小了，导致我的综合胜率变低了。因此得出结论：

<span style="color: #c24f4a">风格不同的卡组将导致胜率下降。</span>

因此我们有几种可行的 lineup 策略可以选择：

* 直接带两套最强卡组（相信其本身的高强度能弥补风格差异带来的胜率损失）
* 带两套风格一致的极端卡组（赌自己不会被抓）
* 带两套万金油卡组（消除风格差异，前提是卡组强度不能过低）
* ~~带两套会玩的/合得起的卡组~~

### 征服 3 赛制
由于征服 3 赛制的计算太过复杂，所以我直接写了个 JavaScript 模拟程序来估计胜率。还有一种可能的做法是使用求纳什均衡解，用数值方法获得结果，但是因为有点麻烦所以我就没那么写。我的模拟程序做了以下假设：

1. 输了的人不会换卡组
2. 对手是纯随机排阵

虽然上述假设与实际不符，会损失一些解的质量，但是应该影响不太大。经过一些测试，可以发现排阵顺序对胜率存在影响，而且<span style="color: #c24f4a">胜率只和哪个卡组放在中间出阵有关系</span>。对于应该将哪个卡组放在中间我也没发现什么特别的规律，如果你知道这背后的数学原理，欢迎留言告诉大家。

### 附件
本文的最后我将用到的模拟程序链接放在下方，卡组对阵胜率可以到[Hearthstone Meta - HSReplay.net](https://hsreplay.net/meta/#tab=matchups)获取。但你应该特别注意单卡替换所带来的影响，并对胜率做出一些估计和调整。对于比赛 lineup 和排阵有兴趣的同学不妨尝试使用一下，相信它会对你提交卡组和排兵布阵带来一些帮助。

[模拟程序 Demo](https://gp.longern.com/demo/2019/01/27/hearthstone-matchup-simulator.html)

[源代码](https://raw.githubusercontent.com/longern/longern.github.io/master/_posts/2019-01-27-hearthstone-matchup-simulator.md)

<script>
document.querySelectorAll('.post table').forEach(table => table.className = 'table')
</script>
