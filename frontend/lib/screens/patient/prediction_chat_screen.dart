import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/api_service.dart';

/// Chat screen specifically for discussing prediction results
/// Receives prediction data directly rather than fetching from API
class PredictionChatScreen extends StatefulWidget {
  final Map<String, dynamic> predictionContext;

  const PredictionChatScreen({super.key, required this.predictionContext});

  @override
  State<PredictionChatScreen> createState() => _PredictionChatScreenState();
}

class _PredictionChatScreenState extends State<PredictionChatScreen> {
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  void _initializeChat() {
    final riskLabel = widget.predictionContext['riskLabel'] ?? 'Unknown';
    final riskPercent =
        widget.predictionContext['risk_percent']?.toStringAsFixed(1) ?? '0';

    // Initial greeting with prediction context
    _messages.add({
      'role': 'ai',
      'text':
          "Hello! I'm here to discuss your prediction results.\n\n"
          "📊 Your Risk Assessment: **$riskLabel** ($riskPercent%)\n\n"
          "I have all the health metrics you just entered. "
          "Feel free to ask me anything about:\n"
          "• What your results mean\n"
          "• How to improve your health metrics\n"
          "• Lifestyle recommendations\n\n"
          "How can I help you today?",
      'time': DateTime.now(),
    });
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'text': text, 'time': DateTime.now()});
      _msgController.clear();
      _isTyping = true;
    });
    _scrollToBottom();

    _getAIResponse(text);
  }

  Future<void> _getAIResponse(String userText) async {
    try {
      // Prepare chat history
      final history = _messages.take(_messages.length - 1).map((m) {
        return {
          'role': m['role'] == 'user' ? 'user' : 'assistant',
          'content': m['text'],
        };
      }).toList();

      // Use the prediction context passed from the predict screen
      final res = await ApiService().dio.post(
        '/ai/chat',
        data: {
          'userMessage': userText,
          'predictionContext': widget.predictionContext,
          'chatHistory': history,
        },
      );

      if (!mounted) return;

      if (res.statusCode == 200 && res.data['success'] == true) {
        final reply = res.data['reply'];
        setState(() {
          _isTyping = false;
          _messages.add({'role': 'ai', 'text': reply, 'time': DateTime.now()});
        });
        _scrollToBottom();
      } else {
        throw Exception(res.data['message'] ?? 'Unknown error');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.add({
          'role': 'ai',
          'text': "I'm having trouble connecting right now. Please try again.",
          'time': DateTime.now(),
        });
      });
      _scrollToBottom();

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final riskLabel = widget.predictionContext['riskLabel'] ?? 'Unknown';
    final isHighRisk = riskLabel == 'High Risk';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: isHighRisk ? Colors.red[700] : const Color(0xFF2E7D32),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.smart_toy_rounded,
                size: 20,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Discuss Your Results',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                Text(
                  riskLabel,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Prediction Summary Card
          Container(
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isHighRisk
                  ? Colors.red.withOpacity(0.1)
                  : Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isHighRisk
                    ? Colors.red.withOpacity(0.3)
                    : Colors.green.withOpacity(0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  isHighRisk
                      ? Icons.warning_rounded
                      : Icons.check_circle_rounded,
                  color: isHighRisk ? Colors.red : Colors.green,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Your Prediction: $riskLabel',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                          color: isHighRisk
                              ? Colors.red[900]
                              : Colors.green[900],
                        ),
                      ),
                      Text(
                        'Risk Score: ${widget.predictionContext['risk_percent']?.toStringAsFixed(1)}%',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn().slideY(begin: -0.1),

          // Chat List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return _buildTypingIndicator();
                }
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                return _buildMessageBubble(msg, isUser);
              },
            ),
          ),

          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F7FA),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _msgController,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: InputDecoration(
                          hintText: 'Ask about your results...',
                          hintStyle: GoogleFonts.poppins(
                            color: Colors.grey[500],
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isHighRisk
                          ? Colors.red[700]
                          : const Color(0xFF2E7D32),
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg, bool isUser) {
    final isHighRisk = widget.predictionContext['riskLabel'] == 'High Risk';
    final accentColor = isHighRisk ? Colors.red[700] : const Color(0xFF2E7D32);

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16, left: 8, right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isUser ? accentColor : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isUser
                ? const Radius.circular(20)
                : const Radius.circular(4),
            bottomRight: isUser
                ? const Radius.circular(4)
                : const Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg['text'],
              style: GoogleFonts.poppins(
                color: isUser ? Colors.white : const Color(0xFF333333),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(msg['time']),
              style: GoogleFonts.poppins(
                color: isUser ? Colors.white70 : Colors.grey[400],
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16, left: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation(Color(0xFF2E7D32)),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Thinking...',
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    ).animate().fadeIn();
  }

  String _formatTime(DateTime time) {
    return "${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}";
  }

  @override
  void dispose() {
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
